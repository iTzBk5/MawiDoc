import { Router } from 'express';
import { appointmentController } from './appointment.controller';
import { authenticate, requireRole } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import {
  bookAppointmentSchema,
  createManualAppointmentSchema,
  appointmentQuerySchema,
} from './appointment.validation';
import { UserRole } from '@mawi-doc/shared';

const router = Router();
router.use(authenticate);

// Patient routes
router.post('/', requireRole(UserRole.PATIENT), validate(bookAppointmentSchema), appointmentController.bookAppointment);
router.get('/', requireRole(UserRole.PATIENT), validate(appointmentQuerySchema, 'query'), appointmentController.getPatientAppointments);
router.delete('/:id', requireRole(UserRole.PATIENT), appointmentController.cancel);

// Doctor routes
router.post('/doctor', requireRole(UserRole.DOCTOR), validate(createManualAppointmentSchema), appointmentController.createManual);
router.get('/doctor', requireRole(UserRole.DOCTOR), validate(appointmentQuerySchema, 'query'), appointmentController.getDoctorAppointments);
router.put('/doctor/:id/accept', requireRole(UserRole.DOCTOR), appointmentController.accept);
router.put('/doctor/:id/reject', requireRole(UserRole.DOCTOR), appointmentController.reject);
router.put('/doctor/:id/cancel', requireRole(UserRole.DOCTOR), appointmentController.cancel);

export default router;
