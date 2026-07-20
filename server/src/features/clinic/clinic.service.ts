import prisma from '../../shared/database';
import { AppError } from '../../shared/middleware/error.middleware';
import logger from '../../shared/utils/logger';

export class ClinicService {
  async getProfile(userId: string) {
    const profile = await prisma.clinicProfile.findUnique({
      where: { userId },
      include: {
        specialties: true,
        doctors: { include: { specialty: true, user: { select: { email: true, phone: true } } } },
        photos: true,
      },
    });

    if (!profile) throw new AppError(404, 'NOT_FOUND', 'Clinic profile not found');
    return profile;
  }

  async getClinicById(clinicId: string) {
    const profile = await prisma.clinicProfile.findUnique({
      where: { id: clinicId },
      include: {
        specialties: true,
        doctors: { include: { specialty: true, user: { select: { email: true, phone: true } } } },
        photos: true,
      },
    });
    if (!profile) throw new AppError(404, 'NOT_FOUND', 'Clinic profile not found');
    return profile;
  }

  async updateProfile(userId: string, data: any) {
    const profile = await prisma.clinicProfile.upsert({
      where: { userId },
      update: {
        name: data.name,
        address: data.address,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      create: {
        userId,
        name: data.name,
        address: data.address,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
    return profile;
  }

  async addSpecialty(userId: string, specialtyId: string) {
    const profile = await prisma.clinicProfile.update({
      where: { userId },
      data: {
        specialties: { connect: { id: specialtyId } }
      },
      include: { specialties: true }
    });
    return profile;
  }

  async removeSpecialty(userId: string, specialtyId: string) {
    const profile = await prisma.clinicProfile.update({
      where: { userId },
      data: {
        specialties: { disconnect: { id: specialtyId } }
      },
      include: { specialties: true }
    });
    return profile;
  }

  async searchDoctors(query: string) {
    return prisma.doctorProfile.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { user: { email: { contains: query, mode: 'insensitive' } } }
        ]
      },
      include: { specialty: true, user: true },
      take: 10
    });
  }

  async addDoctor(clinicUserId: string, doctorId: string) {
    const clinic = await prisma.clinicProfile.findUnique({ where: { userId: clinicUserId } });
    if (!clinic) throw new AppError(404, 'NOT_FOUND', 'Clinic profile not found');

    return prisma.doctorProfile.update({
      where: { id: doctorId },
      data: { clinicId: clinic.id },
      include: { specialty: true }
    });
  }

  async removeDoctor(clinicUserId: string, doctorId: string) {
    const clinic = await prisma.clinicProfile.findUnique({ where: { userId: clinicUserId } });
    if (!clinic) throw new AppError(404, 'NOT_FOUND', 'Clinic profile not found');

    const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
    if (doctor?.clinicId !== clinic.id) throw new AppError(403, 'FORBIDDEN', 'Doctor is not in this clinic');

    return prisma.doctorProfile.update({
      where: { id: doctorId },
      data: { clinicId: null }
    });
  }

  async addGalleryPhoto(clinicUserId: string, url: string) {
    const clinic = await prisma.clinicProfile.findUnique({ where: { userId: clinicUserId } });
    if (!clinic) throw new AppError(404, 'NOT_FOUND', 'Clinic profile not found');

    return prisma.galleryPhoto.create({
      data: {
        clinicId: clinic.id,
        url
      }
    });
  }

  async removeGalleryPhoto(photoId: string) {
    return prisma.galleryPhoto.delete({
      where: { id: photoId }
    });
  }

  async getStatistics(userId: string) {
    const profile = await prisma.clinicProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'NOT_FOUND', 'Clinic profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const doctorIds = (await prisma.doctorProfile.findMany({
      where: { clinicId: profile.id },
      select: { id: true }
    })).map(d => d.id);

    if (doctorIds.length === 0) {
      return { totalAppointments: 0, todayAppointments: 0, monthlyAppointments: 0, cancelledAppointments: 0, passedPatients: 0 };
    }

    const [totalAppointments, todayAppointments, monthlyAppointments, cancelledAppointments, allAppointments] =
      await Promise.all([
        prisma.appointment.count({ where: { doctorId: { in: doctorIds } } }),
        prisma.appointment.count({
          where: { doctorId: { in: doctorIds }, date: { gte: today, lt: tomorrow } },
        }),
        prisma.appointment.count({
          where: { doctorId: { in: doctorIds }, date: { gte: firstDayOfMonth } },
        }),
        prisma.appointment.count({
          where: { doctorId: { in: doctorIds }, status: 'CANCELLED' },
        }),
        prisma.appointment.findMany({
          where: { doctorId: { in: doctorIds } },
          select: { id: true, patientId: true, date: true, startTime: true, status: true },
        }),
      ]);

    const now = new Date();
    const passedPatientsSet = new Set<string>();
    
    for (const appt of allAppointments) {
      if (appt.status !== 'CANCELLED' && appt.status !== 'REJECTED') {
        const [hours, minutes] = (appt.startTime || '00:00').split(':').map(Number);
        const apptDateStr = appt.date.toISOString().split('T')[0];
        const apptDateTimeStr = `${apptDateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        const apptDate = new Date(apptDateTimeStr);
        
        if (apptDate.getTime() < now.getTime()) {
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

  async getAppointments(userId: string, date?: string) {
    const profile = await prisma.clinicProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'NOT_FOUND', 'Clinic profile not found');

    const doctorIds = (await prisma.doctorProfile.findMany({
      where: { clinicId: profile.id },
      select: { id: true }
    })).map(d => d.id);

    const where: any = { doctorId: { in: doctorIds } };
    if (date) {
      // e.g. "2026-07-16"
      const parsedDate = new Date(date);
      // Because date is saved as UTC midnight, ensure exactly matched
      where.date = parsedDate;
    }

    return prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { fullName: true, user: { select: { phone: true } } } },
        doctor: { select: { fullName: true, specialty: true } }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });
  }

  async updateStatus(userId: string, isOpen: boolean) {
    const profile = await prisma.clinicProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'NOT_FOUND', 'Clinic profile not found');

    await prisma.clinicProfile.update({
      where: { id: profile.id },
      data: { isOpen }
    });

    if (!isOpen) {
      await prisma.doctorProfile.updateMany({
        where: { clinicId: profile.id },
        data: { isOpen: false }
      });
    }

    return { isOpen };
  }

  async getSpecialties() {
    return prisma.specialty.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async updateSpecialties(userId: string, specialtyIds: string[]) {
    const profile = await prisma.clinicProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'NOT_FOUND', 'Clinic profile not found');

    // First disconnect all
    await prisma.clinicProfile.update({
      where: { id: profile.id },
      data: { specialties: { set: [] } }
    });

    // Connect new ones
    return prisma.clinicProfile.update({
      where: { id: profile.id },
      data: {
        specialties: { connect: specialtyIds.map(id => ({ id })) }
      },
      include: { specialties: true }
    });
  }
}

export const clinicService = new ClinicService();
