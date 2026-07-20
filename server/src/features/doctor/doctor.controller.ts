import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { doctorService } from './doctor.service';
import { AppError } from '../../shared/middleware/error.middleware';

export class DoctorController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await doctorService.getProfile(req.user!.userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await doctorService.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await doctorService.updateLocation(req.user!.userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await doctorService.updateStatus(req.user!.userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getWorkingDays(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await doctorService.getProfile(req.user!.userId);
      res.json({ success: true, data: (profile as any).workingDays });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkingDays(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await doctorService.updateWorkingDays(req.user!.userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getAvailableSlots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await doctorService.getProfile(req.user!.userId);
      const date = req.query.date as string | undefined;
      const result = await doctorService.getAvailableSlots((profile as any).id, date);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await doctorService.getStatistics(req.user!.userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getDoctorById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await doctorService.getDoctorById(req.params.id as string);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getDoctorSlots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const result = await doctorService.getAvailableSlots(req.params.id as string, date);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async addGalleryPhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let finalUrl = req.body.url;
      
      if (req.file) {
        finalUrl = req.file.path; // Cloudinary URL
      }

      if (!finalUrl) throw new AppError(400, 'BAD_REQUEST', 'Image file or url is required');
      
      const result = await doctorService.addGalleryPhoto(req.user!.userId, finalUrl);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async removeGalleryPhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await doctorService.removeGalleryPhoto(req.user!.userId, req.params.photoId as string);
      res.json({ success: true, message: 'Photo removed' });
    } catch (err) {
      next(err);
    }
  }
}

export const doctorController = new DoctorController();
