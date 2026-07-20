import { Router } from 'express';
import { patientController } from './patient.controller';
import { authenticate, requireRole } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updatePatientSchema } from './patient.validation';
import { UserRole } from '@mawi-doc/shared';

const router = Router();

router.use(authenticate, requireRole(UserRole.PATIENT));

router.get('/profile', patientController.getProfile);
router.put('/profile', validate(updatePatientSchema), patientController.updateProfile);

export default router;
