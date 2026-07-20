import cron from 'node-cron';
import { AppointmentStatus } from '@prisma/client';
import logger from '../utils/logger';
import { notificationService } from '../../features/notification/notification.service';
import prisma from '../database';

// Run every 15 minutes to check for appointments
export function startAppointmentReminderCron() {
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Running appointment reminder cron job');

    try {
      const now = new Date();
      
      // We look at all appointments today and tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED] },
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lte: tomorrow,
          },
        },
        include: {
          patient: true,
          doctor: { include: { specialty: true } },
        },
      });

      for (const appointment of upcomingAppointments) {
        // Parse the exact appointment Date/Time
        const [hours, minutes] = appointment.startTime.split(':').map(Number);
        const appointmentDateTime = new Date(appointment.date);
        appointmentDateTime.setHours(hours, minutes, 0, 0);

        const timeDiffMs = appointmentDateTime.getTime() - now.getTime();
        const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

        if (timeDiffHours <= 0) continue; // Already passed
        if (!appointment.patient) continue; // Skip manual walk-in patients

        // Check 1-hour reminder (between 0.75 and 1.25 hours from now)
        if (timeDiffHours > 0.75 && timeDiffHours <= 1.25) {
          const title = 'Upcoming Appointment in 1 Hour';
          const existing = await prisma.notification.findFirst({
            where: { userId: appointment.patient.userId, appointmentId: appointment.id, title },
          });

          if (!existing) {
            await notificationService.create(
              appointment.patient.userId,
              title,
              `You have an appointment with ${appointment.doctor.fullName} at ${appointment.startTime}.`,
              { appointmentId: appointment.id, type: 'REMINDER_1H' }
            );
            logger.info({ appointmentId: appointment.id }, '1-hour reminder sent');
          }
        }
        // Check 24-hour reminder (between 23 and 25 hours from now)
        else if (timeDiffHours > 23 && timeDiffHours <= 25) {
          const title = 'Appointment Reminder';
          const existing = await prisma.notification.findFirst({
            where: { userId: appointment.patient.userId, appointmentId: appointment.id, title },
          });

          if (!existing) {
            await notificationService.create(
              appointment.patient.userId,
              title,
              `You have an appointment with ${appointment.doctor.fullName} tomorrow at ${appointment.startTime}.`,
              { appointmentId: appointment.id, type: 'REMINDER_24H' }
            );
            logger.info({ appointmentId: appointment.id }, '24-hour reminder sent');
          }
        }
      }

      logger.info('Appointment reminder cron completed');
    } catch (error) {
      logger.error({ err: error }, 'Appointment reminder cron failed');
    }
  });

  logger.info('📅 Appointment reminder cron job started');
}
