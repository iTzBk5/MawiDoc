import { AppError } from '../../shared/middleware/error.middleware';
import { UpdatePatientInput } from './patient.validation';
import logger from '../../shared/utils/logger';
import prisma from '../../shared/database';

export class PatientService {
  async getProfile(userId: string) {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true, phone: true, role: true } } },
    });

    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Patient profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, data: UpdatePatientInput) {
    const profile = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Patient profile not found');
    }

    const updated = await prisma.patientProfile.update({
      where: { userId },
      data,
    });

    logger.info({ userId, fields: Object.keys(data) }, 'Patient profile updated');
    return updated;
  }
}

export const patientService = new PatientService();
