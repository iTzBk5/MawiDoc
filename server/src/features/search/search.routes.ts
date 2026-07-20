import { Router } from 'express';
import { searchController } from './search.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/doctors', searchController.searchDoctors);
router.get('/clinics', searchController.searchClinics);
router.get('/doctors/nearby', searchController.getNearbyDoctors);
router.get('/specialties', searchController.getSpecialties);

export default router;
