import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../../config/env';
import { hashPassword, comparePassword } from '../../shared/utils/helpers';
import { AppError } from '../../shared/middleware/error.middleware';
import logger from '../../shared/utils/logger';
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.validation';
import prisma from '../../shared/database';

export class AuthService {
  async register(data: RegisterInput) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      if (!existingEmail.isVerified) {
        await prisma.user.delete({ where: { id: existingEmail.id } });
      } else {
        throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
      }
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) {
      if (!existingPhone.isVerified) {
        await prisma.user.delete({ where: { id: existingPhone.id } });
      } else {
        throw new AppError(409, 'PHONE_EXISTS', 'An account with this phone number already exists');
      }
    }

    const existingUsername = await prisma.patientProfile.findUnique({ 
      where: { username: data.username },
      include: { user: true }
    });
    
    if (existingUsername) {
      if (!existingUsername.user.isVerified) {
        await prisma.user.delete({ where: { id: existingUsername.userId } });
      } else {
        throw new AppError(409, 'USERNAME_EXISTS', 'This username is already taken');
      }
    }

    const hashedPassword = await hashPassword(data.password);

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: UserRole.PATIENT,
        isVerified: false,
        verificationCode,
        patientProfile: {
          create: {
            fullName: data.fullName,
            username: data.username,
            age: data.age,
            gender: data.gender,
            city: data.city,
          },
        },
      },
      include: { patientProfile: true },
    });

    logger.info({ userId: user.id, email: user.email }, 'New patient registered, awaiting verification');

    // Send email using Google Apps Script Webhook asynchronously in the background
    const sendVerificationEmail = async () => {
      try {
        const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
        if (!googleScriptUrl) {
          logger.warn(`GOOGLE_SCRIPT_URL missing in .env. Mocking email. OTP for ${user.email} is ${verificationCode}`);
          return;
        }
        
        const response = await fetch(googleScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: user.email,
            subject: 'Verify your Mawidoc account',
            html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
          }),
        });

        if (response.ok) {
          logger.info(`Verification email sent to ${user.email} via Google Apps Script`);
        } else {
          const errorData = await response.text();
          logger.error({ err: errorData }, `Google Apps Script Error. For testing, the OTP for ${user.email} is: ${verificationCode}`);
        }
      } catch (error) {
        logger.error({ err: error }, `Failed to send verification email. For testing, the OTP for ${user.email} is: ${verificationCode}`);
      }
    };
    
    // Fire and forget
    sendVerificationEmail();

    return {
      message: 'Registration successful. Please check your email for the verification code.',
      email: user.email
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }
    
    if (user.isVerified) {
      throw new AppError(400, 'ALREADY_VERIFIED', 'User is already verified');
    }

    if (user.verificationCode !== code) {
      throw new AppError(400, 'INVALID_CODE', 'Invalid verification code');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
      },
    });

    logger.info({ userId: user.id }, 'User verified successfully');

    const token = this.generateToken(user.id, user.role);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileComplete: true,
      },
    };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.isVerified) {
      throw new AppError(403, 'UNVERIFIED_ACCOUNT', 'Please verify your email before logging in');
    }

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    let profileComplete = true;
    if (user.role === UserRole.DOCTOR) {
      const profile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
      profileComplete = !!profile && !!profile.specialtyId;
    } else if (user.role === UserRole.CLINIC) {
      const profile = await prisma.clinicProfile.findUnique({ where: { userId: user.id } });
      profileComplete = !!profile;
    }

    logger.info({ userId: user.id, role: user.role }, 'User logged in');

    const token = this.generateToken(user.id, user.role);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileComplete,
      },
    };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'If an account exists, a code will be sent.');
    }

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordCode: resetCode },
    });

    const sendResetEmail = async () => {
      try {
        const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
        if (!googleScriptUrl) {
          logger.warn(`GOOGLE_SCRIPT_URL missing in .env. Mocking email. Reset code for ${user.email} is ${resetCode}`);
          return;
        }

        const response = await fetch(googleScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: user.email,
            subject: 'Reset your Mawidoc password',
            html: `<p>Your password reset code is: <strong>${resetCode}</strong></p>`,
          }),
        });

        if (response.ok) {
          logger.info(`Password reset email sent to ${user.email} via Google Apps Script`);
        } else {
          const errorData = await response.text();
          logger.error({ err: errorData }, `Google Apps Script Error. For testing, the reset code for ${user.email} is: ${resetCode}`);
        }
      } catch (error) {
        logger.error({ err: error }, `Failed to send password reset email. For testing, the reset code for ${user.email} is: ${resetCode}`);
      }
    };
    
    // Fire and forget
    sendResetEmail();

    return { message: 'If an account exists, a verification code has been sent.' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    
    if (!user || user.resetPasswordCode !== data.code) {
      throw new AppError(400, 'INVALID_CODE', 'Invalid or expired verification code');
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordCode: null,
      },
    });

    logger.info({ userId: user.id }, 'User reset password successfully');
    return { message: 'Password reset successful' };
  }

  private generateToken(userId: string, role: UserRole): string {
    return jwt.sign(
      { userId, role } as object,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }
}

export const authService = new AuthService();
