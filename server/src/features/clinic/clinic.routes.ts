import { Router } from 'express';
import { clinicController } from './clinic.controller';
import { authenticate, requireRole } from '../../shared/middleware/auth.middleware';
import { UserRole } from '@mawi-doc/shared';
import { upload } from '../../shared/middleware/upload.middleware';

const router = Router();

// Public routes
router.get('/public/:id', authenticate, requireRole(UserRole.PATIENT), clinicController.getClinicById);

const authRouter = Router();
authRouter.use(authenticate, requireRole(UserRole.CLINIC));

// Profile
authRouter.get('/profile', clinicController.getProfile);
authRouter.put('/profile', clinicController.updateProfile);

// Dashboard
authRouter.get('/statistics', clinicController.getStatistics);
authRouter.put('/status', clinicController.updateStatus);

// Appointments
authRouter.get('/appointments', clinicController.getAppointments);

// Specialties
authRouter.get('/specialties-list', clinicController.getSpecialties);
authRouter.post('/specialties/update', clinicController.updateSpecialties);
authRouter.post('/specialties', clinicController.addSpecialty);
authRouter.delete('/specialties/:specialtyId', clinicController.removeSpecialty);

// Team (Doctors)
authRouter.get('/doctors/search', clinicController.searchDoctors);
authRouter.post('/doctors', clinicController.addDoctor);
authRouter.delete('/doctors/:doctorId', clinicController.removeDoctor);

// Gallery Photos
authRouter.post('/gallery', upload.single('photo'), clinicController.addGalleryPhoto);
authRouter.delete('/gallery/:photoId', clinicController.removeGalleryPhoto);

router.use('/', authRouter);

export default router;
