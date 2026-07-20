import { AppointmentStatus } from '@prisma/client';
import { AppError } from '../../shared/middleware/error.middleware';
import logger from '../../shared/utils/logger';
import { BookAppointmentInput, CreateManualAppointmentInput, AppointmentQuery } from './appointment.validation';
import prisma from '../../shared/database';
import { notificationService } from '../notification/notification.service';

export class AppointmentService {
  async bookPatientAppointment(patientUserId: string, data: BookAppointmentInput) {
    // Verify patient profile
    const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: patientUserId } });
    if (!patientProfile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Patient profile not found');
    }

    // Verify doctor exists and is open
    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { id: data.doctorId } });
    if (!doctorProfile) {
      throw new AppError(404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
    }
    if (!doctorProfile.isOpen) {
      throw new AppError(400, 'CLINIC_CLOSED', 'Doctor clinic is currently closed');
    }

    // Verify slot exists and is not booked
    const slot = await prisma.availableSlot.findUnique({ where: { id: data.slotId } });
    if (!slot) {
      throw new AppError(404, 'SLOT_NOT_FOUND', 'Appointment slot not found');
    }
    if (slot.isBooked) {
      throw new AppError(409, 'SLOT_BOOKED', 'This slot is already booked');
    }

    // Check if the patient already has ANY active appointment
    const activeAppt = await prisma.appointment.findFirst({
      where: {
        patientId: patientProfile.id,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });
    if (activeAppt) {
      throw new AppError(409, 'LIMIT_REACHED', 'You can only have one active appointment at a time. Please complete or cancel your existing appointment first.');
    }

    // Check rate limit: max 3 appointments in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentApptsCount = await prisma.appointment.count({
      where: {
        patientId: patientProfile.id,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentApptsCount >= 3) {
      throw new AppError(429, 'RATE_LIMIT_EXCEEDED', 'You can only book up to 3 appointments per hour. Please wait before booking again.');
    }

    // Create appointment and mark slot as booked in a transaction
    const appointment = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.create({
        data: {
          patientId: patientProfile.id,
          doctorId: data.doctorId,
          slotId: data.slotId,
          date: new Date(data.date),
          startTime: data.startTime,
          endTime: data.endTime,
          notes: data.notes,
          status: AppointmentStatus.ACCEPTED,
        },
        include: {
          doctor: { include: { specialty: true } },
          patient: true,
        },
      });

      await tx.availableSlot.update({
        where: { id: data.slotId },
        data: { isBooked: true },
      });

      return appt;
    });

    logger.info({ appointmentId: appointment.id, doctorId: data.doctorId }, 'Appointment booked by patient');

    await notificationService.create(
      doctorProfile.userId,
      'New Appointment Request',
      `${patientProfile.fullName} has requested a new appointment on ${appointment.date.toISOString().split('T')[0]} at ${appointment.startTime}.`,
      { appointmentId: appointment.id, type: 'NEW_APPOINTMENT' }
    );

    return appointment;
  }

  async createManualAppointment(doctorUserId: string, data: CreateManualAppointmentInput) {
    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctorProfile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    if (data.patientId) {
      const patientProfile = await prisma.patientProfile.findUnique({ where: { id: data.patientId } });
      if (!patientProfile) {
        throw new AppError(404, 'PATIENT_NOT_FOUND', 'Patient not found');
      }
    }

    const appointment = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.create({
        data: {
          patientId: data.patientId || null,
          patientName: data.patientName,
          doctorId: doctorProfile.id,
          slotId: data.slotId || null,
          date: new Date(data.date),
          startTime: data.startTime,
          endTime: data.endTime,
          notes: data.notes,
          status: AppointmentStatus.ACCEPTED,
        },
        include: {
          patient: true,
          doctor: { include: { specialty: true } },
        },
      });

      if (data.slotId) {
        await tx.availableSlot.update({
          where: { id: data.slotId },
          data: { isBooked: true },
        });
      }

      return appt;
    });

    logger.info({ appointmentId: appointment.id, doctorId: doctorProfile.id }, 'Manual appointment created');
    return appointment;
  }

  async acceptAppointment(doctorUserId: string, appointmentId: string) {
    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctorProfile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) {
      throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
    }
    if (appointment.doctorId !== doctorProfile.id) {
      throw new AppError(403, 'FORBIDDEN', 'You can only manage your own appointments');
    }
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new AppError(400, 'INVALID_STATUS', 'Only pending appointments can be accepted');
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.ACCEPTED },
      include: { patient: true, doctor: { include: { specialty: true } } },
    });

    logger.info({ appointmentId }, 'Appointment accepted');
    return updated;
  }

  async rejectAppointment(doctorUserId: string, appointmentId: string) {
    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!doctorProfile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) {
      throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
    }
    if (appointment.doctorId !== doctorProfile.id) {
      throw new AppError(403, 'FORBIDDEN', 'You can only manage your own appointments');
    }
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new AppError(400, 'INVALID_STATUS', 'Only pending appointments can be rejected');
    }

    const [updated] = await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.REJECTED },
        include: { patient: true, doctor: { include: { specialty: true } } },
      }),
      ...(appointment.slotId
        ? [prisma.availableSlot.update({ where: { id: appointment.slotId }, data: { isBooked: false } })]
        : []),
    ]);

    logger.info({ appointmentId }, 'Appointment rejected');
    return updated;
  }

  async cancelAppointment(userId: string, role: string, appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) {
      throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
    }

    // Verify ownership
    if (role === 'PATIENT') {
      const profile = await prisma.patientProfile.findUnique({ where: { userId } });
      if (!profile || profile.id !== appointment.patientId) {
        throw new AppError(403, 'FORBIDDEN', 'You can only cancel your own appointments');
      }
    } else {
      const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
      if (!profile || profile.id !== appointment.doctorId) {
        throw new AppError(403, 'FORBIDDEN', 'You can only cancel your own appointments');
      }
    }

    if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED) {
      throw new AppError(400, 'INVALID_STATUS', 'Cannot cancel this appointment');
    }

    // Check if appointment is in the past
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    const appointmentDateTime = new Date(appointment.date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    if (appointmentDateTime.getTime() < Date.now()) {
      throw new AppError(400, 'INVALID_STATUS', 'Cannot cancel a past appointment');
    }

    const [updated] = await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CANCELLED },
        include: { patient: true, doctor: { include: { specialty: true } } },
      }),
      ...(appointment.slotId
        ? [prisma.availableSlot.update({ where: { id: appointment.slotId }, data: { isBooked: false } })]
        : []),
    ]);

    logger.info({ appointmentId, cancelledBy: role }, 'Appointment cancelled');
    return updated;
  }

  async getPatientAppointments(patientUserId: string, query: AppointmentQuery) {
    const profile = await prisma.patientProfile.findUnique({ where: { userId: patientUserId } });
    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Patient profile not found');
    }

    const where: Record<string, unknown> = { patientId: profile.id };
    if (query.status) where.status = query.status;
    if (query.date) {
      const d = new Date(query.date);
      d.setHours(0, 0, 0, 0);
      where.date = d;
    }

    const skip = (query.page - 1) * query.limit;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          doctor: { include: { specialty: true } },
        },
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        skip,
        take: query.limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getDoctorAppointments(doctorUserId: string, query: AppointmentQuery) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } });
    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Doctor profile not found');
    }

    const where: Record<string, unknown> = { doctorId: profile.id };
    if (query.status) where.status = query.status;
    if (query.date) {
      const d = new Date(query.date);
      d.setHours(0, 0, 0, 0);
      where.date = d;
    }

    const skip = (query.page - 1) * query.limit;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: true,
          doctor: { include: { specialty: true } },
        },
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        skip,
        take: query.limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}

export const appointmentService = new AppointmentService();
