import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  slotId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

export const createManualAppointmentSchema = z.object({
  patientId: z.string().uuid().optional(),
  patientName: z.string().min(2).optional(),
  slotId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
}).refine(data => data.patientId || data.patientName, {
  message: "Either an existing patient or a patient name must be provided",
});

export const appointmentQuerySchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type CreateManualAppointmentInput = z.infer<typeof createManualAppointmentSchema>;
export type AppointmentQuery = z.infer<typeof appointmentQuerySchema>;
