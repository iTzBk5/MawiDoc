import { z } from 'zod';

export const updatePatientSchema = z.object({
  fullName: z.string().min(2).optional(),
  age: z.number().int().min(1).max(120).optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  city: z.string().min(1).optional(),
});

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
