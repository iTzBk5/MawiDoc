import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').refine(val => val.toLowerCase().endsWith('@gmail.com'), 'Only @gmail.com emails are allowed'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').regex(/^\+?\d+$/, 'Phone must contain only digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username must contain only letters, numbers, and underscores'),
  age: z.number().int().min(1).max(120),
  gender: z.enum(['MALE', 'FEMALE']),
  city: z.string().min(1, 'City is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(4, 'Code must be 4 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
