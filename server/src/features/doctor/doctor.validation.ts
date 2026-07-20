import { z } from 'zod';

export const updateDoctorSchema = z.object({
  fullName: z.string().min(2).optional(),
  clinicName: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  description: z.string().optional(),
  consultationPrice: z.number().positive().optional(),
  profilePicture: z.string().optional(),
  specialtyId: z.string().uuid().optional(),
});

export const updateDoctorLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateDoctorStatusSchema = z.object({
  isOpen: z.boolean(),
});

export const updateWorkingDaysSchema = z.object({
  days: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    isActive: z.boolean(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })).length(7),
});

export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type UpdateLocationInput = z.infer<typeof updateDoctorLocationSchema>;
export type UpdateStatusInput = z.infer<typeof updateDoctorStatusSchema>;
export type UpdateWorkingDaysInput = z.infer<typeof updateWorkingDaysSchema>;
