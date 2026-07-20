import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { patientService } from './patient.service';

export class PatientController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await patientService.getProfile(req.user!.userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await patientService.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const patientController = new PatientController();
