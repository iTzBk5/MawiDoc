import { AppError } from '../../shared/middleware/error.middleware';
import { generateTimeSlots } from '../../shared/utils/helpers';
import logger from '../../shared/utils/logger';
import { UpdateDoctorInput, UpdateLocationInput, UpdateStatusInput, UpdateWorkingDaysInput } from './doctor.validation';
import prisma from '../../shared/database';

export class DoctorService {
  async getProfile(userId: string) {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        specialty: true,
        workingDays: { orderBy: { dayOfWeek: 'asc' } },
        user: { select: { id: true, email: true, phone: true, role: true } },
        photos: true,
        clinic: { select: { id: true, name: true, profilePicture: true } },
      },
    });

    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    return profile;
  }

  async getDoctorById(doctorId: string) {
    const profile = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: {
        specialty: true,
        workingDays: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' } },
        photos: true,
        clinic: { select: { id: true, name: true, profilePicture: true, latitude: true, longitude: true, photos: true } },
      },
    });

    if (!profile) {
      throw new AppError(404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
    }

    return profile;
  }

  async updateProfile(userId: string, data: UpdateDoctorInput) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    if (data.specialtyId) {
      const specialty = await prisma.specialty.findUnique({ where: { id: data.specialtyId } });
      if (!specialty) {
        throw new AppError(404, 'SPECIALTY_NOT_FOUND', 'Specialty not found');
      }
    }

    const updated = await prisma.doctorProfile.update({
      where: { userId },
      data,
      include: { specialty: true },
    });

    logger.info({ userId, fields: Object.keys(data) }, 'Doctor profile updated');
    return updated;
  }

  async updateLocation(userId: string, data: UpdateLocationInput) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    const updated = await prisma.doctorProfile.update({
      where: { userId },
      data: { latitude: data.latitude, longitude: data.longitude },
    });

    logger.info({ userId }, 'Doctor location updated');
    return updated;
  }

  async updateStatus(userId: string, data: UpdateStatusInput) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    const updated = await prisma.doctorProfile.update({
      where: { userId },
      data: { isOpen: data.isOpen },
    });

    logger.info({ userId, isOpen: data.isOpen }, 'Doctor status toggled');
    return updated;
  }

  async updateWorkingDays(userId: string, data: UpdateWorkingDaysInput) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    const doctorId = profile.id;

    // Update each working day
    for (const day of data.days) {
      await prisma.workingDay.upsert({
        where: { doctorId_dayOfWeek: { doctorId, dayOfWeek: day.dayOfWeek } },
        update: { isActive: day.isActive, startTime: day.startTime, endTime: day.endTime },
        create: { doctorId, dayOfWeek: day.dayOfWeek, isActive: day.isActive, startTime: day.startTime, endTime: day.endTime },
      });
    }

    // Regenerate available slots for the next 14 days based on new working days
    await this.regenerateSlots(doctorId, data.days);

    const updatedDays = await prisma.workingDay.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });

    logger.info({ userId }, 'Doctor working days updated');
    return updatedDays;
  }

  private async regenerateSlots(doctorId: string, workingDays: UpdateWorkingDaysInput['days']) {
    // Create UTC midnight representing local today to match Prisma @db.Date behavior
    const todayStr = new Date().toLocaleDateString('en-CA');
    const today = new Date(todayStr);

    await prisma.availableSlot.deleteMany({
      where: {
        doctorId,
        isBooked: false,
        date: { gte: today },
      },
    });

    // Generate new slots for next 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + dayOffset);
      const dayOfWeek = date.getUTCDay();

      const workingDay = workingDays.find((d) => d.dayOfWeek === dayOfWeek);
      if (!workingDay || !workingDay.isActive) continue;

      const startHour = parseInt(workingDay.startTime.split(':')[0], 10);
      const endHour = parseInt(workingDay.endTime.split(':')[0], 10);
      const slots = generateTimeSlots(startHour, endHour, 30);

      for (let i = 0; i < slots.length - 1; i++) {
        const existingSlot = await prisma.availableSlot.findUnique({
          where: { doctorId_date_startTime: { doctorId, date, startTime: slots[i] } },
        });

        if (!existingSlot) {
          await prisma.availableSlot.create({
            data: {
              doctorId,
              date,
              startTime: slots[i],
              endTime: slots[i + 1] || `${String(endHour).padStart(2, '0')}:00`,
            },
          });
        }
      }
    }
  }

  async getAvailableSlots(doctorId: string, date?: string) {
    const where: Record<string, unknown> = { doctorId };

    if (date) {
      // date is "YYYY-MM-DD", new Date() parses it as UTC midnight
      where.date = new Date(date);
    } else {
      // Create UTC midnight representing local today
      const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local time
      where.date = { gte: new Date(todayStr) };
    }

    return prisma.availableSlot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async getStatistics(userId: string) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    const doctorId = profile.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalAppointments, todayAppointments, monthlyAppointments, cancelledAppointments, allAppointments] =
      await Promise.all([
        prisma.appointment.count({ where: { doctorId } }),
        prisma.appointment.count({
          where: { doctorId, date: { gte: today, lt: tomorrow } },
        }),
        prisma.appointment.count({
          where: { doctorId, date: { gte: firstDayOfMonth } },
        }),
        prisma.appointment.count({
          where: { doctorId, status: 'CANCELLED' },
        }),
        prisma.appointment.findMany({
          where: { doctorId },
          select: { id: true, patientId: true, date: true, startTime: true, status: true },
        }),
      ]);

    const now = new Date();
    const passedPatientsSet = new Set<string>();
    
    for (const appt of allAppointments) {
      if (appt.status !== 'CANCELLED' && appt.status !== 'REJECTED') {
        const [hours, minutes] = (appt.startTime || '00:00').split(':').map(Number);
        
        // Ensure we parse the DB UTC date strictly as a local date so we don't shift days
        const apptDateStr = appt.date.toISOString().split('T')[0];
        const apptDateTimeStr = `${apptDateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        const apptDate = new Date(apptDateTimeStr);
        
        if (apptDate.getTime() < now.getTime()) {
          // Count every passed appointment, even for the same patient
          passedPatientsSet.add(appt.id);
        }
      }
    }

    return {
      totalAppointments,
      todayAppointments,
      monthlyAppointments,
      cancelledAppointments,
      passedPatients: passedPatientsSet.size,
    };
  }

  async addGalleryPhoto(userId: string, url: string) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');

    return prisma.galleryPhoto.create({
      data: {
        doctorId: profile.id,
        url
      }
    });
  }

  async removeGalleryPhoto(userId: string, photoId: string) {
    return prisma.galleryPhoto.delete({
      where: { id: photoId }
    });
  }
}

export const doctorService = new DoctorService();
