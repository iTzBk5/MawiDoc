import { Router } from 'express';
import { doctorController } from './doctor.controller';
import { authenticate, requireRole } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import {
  updateDoctorSchema,
  updateDoctorLocationSchema,
  updateDoctorStatusSchema,
  updateWorkingDaysSchema,
} from './doctor.validation';
import { UserRole } from '@mawi-doc/shared';
import { upload } from '../../shared/middleware/upload.middleware';

const router = Router();

// Public routes (for patients viewing doctor info)
router.get('/public/:id', authenticate, requireRole(UserRole.PATIENT), doctorController.getDoctorById);
router.get('/public/:id/slots', authenticate, requireRole(UserRole.PATIENT), doctorController.getDoctorSlots);

// Doctor-only routes
const doctorRouter = Router();
doctorRouter.use(authenticate, requireRole(UserRole.DOCTOR));

doctorRouter.get('/profile', doctorController.getProfile);
doctorRouter.put('/profile', validate(updateDoctorSchema), doctorController.updateProfile);
doctorRouter.put('/location', validate(updateDoctorLocationSchema), doctorController.updateLocation);
doctorRouter.put('/status', validate(updateDoctorStatusSchema), doctorController.updateStatus);
doctorRouter.get('/working-days', doctorController.getWorkingDays);
doctorRouter.put('/working-days', validate(updateWorkingDaysSchema), doctorController.updateWorkingDays);
doctorRouter.get('/slots', doctorController.getAvailableSlots);
doctorRouter.get('/statistics', doctorController.getStatistics);
doctorRouter.post('/gallery', upload.single('photo'), doctorController.addGalleryPhoto);
doctorRouter.delete('/gallery/:photoId', doctorController.removeGalleryPhoto);

router.use('/', doctorRouter);

export default router;
