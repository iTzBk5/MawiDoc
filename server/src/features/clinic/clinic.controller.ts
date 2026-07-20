import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { clinicService } from './clinic.service';
import { AppError } from '../../shared/middleware/error.middleware';

export class ClinicController {
  async getClinicById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clinicId = req.params.id as string;
      const profile = await clinicService.getClinicById(clinicId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  }
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await clinicService.getProfile(req.user!.userId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await clinicService.updateProfile(req.user!.userId, req.body);
      res.json({ message: 'Profile updated successfully', data: profile });
    } catch (err) {
      next(err);
    }
  }

  async addSpecialty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { specialtyId } = req.body;
      if (!specialtyId) throw new AppError(400, 'BAD_REQUEST', 'specialtyId is required');
      const profile = await clinicService.addSpecialty(req.user!.userId, specialtyId);
      res.json({ message: 'Specialty added successfully', data: profile });
    } catch (err) {
      next(err);
    }
  }

  async removeSpecialty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const specialtyId = req.params.specialtyId as string;
      const profile = await clinicService.removeSpecialty(req.user!.userId, specialtyId);
      res.json({ message: 'Specialty removed successfully', data: profile });
    } catch (err) {
      next(err);
    }
  }

  async searchDoctors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const results = await clinicService.searchDoctors(q as string || '');
      res.json({ data: results });
    } catch (err) {
      next(err);
    }
  }

  async addDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { doctorId } = req.body;
      if (!doctorId) throw new AppError(400, 'BAD_REQUEST', 'doctorId is required');
      const doctor = await clinicService.addDoctor(req.user!.userId, doctorId);
      res.json({ message: 'Doctor added successfully', data: doctor });
    } catch (err) {
      next(err);
    }
  }

  async removeDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.doctorId as string;
      const doctor = await clinicService.removeDoctor(req.user!.userId, doctorId);
      res.json({ message: 'Doctor removed successfully', data: doctor });
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
      
      const photo = await clinicService.addGalleryPhoto(req.user!.userId, finalUrl);
      res.status(201).json({ message: 'Photo added successfully', data: photo });
    } catch (err) {
      next(err);
    }
  }

  async removeGalleryPhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const photoId = req.params.photoId as string;
      await clinicService.removeGalleryPhoto(photoId);
      res.json({ message: 'Photo removed successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await clinicService.getStatistics(req.user!.userId);
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  }

  async getAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const appointments = await clinicService.getAppointments(req.user!.userId, date);
      res.json({ data: appointments });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { isOpen } = req.body;
      if (typeof isOpen !== 'boolean') throw new AppError(400, 'BAD_REQUEST', 'isOpen boolean is required');
      const result = await clinicService.updateStatus(req.user!.userId, isOpen);
      res.json({ message: 'Status updated successfully', data: result });
    } catch (err) {
      next(err);
    }
  }

  async getSpecialties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const specialties = await clinicService.getSpecialties();
      res.json({ data: specialties });
    } catch (err) {
      next(err);
    }
  }

  async updateSpecialties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { specialtyIds } = req.body;
      if (!Array.isArray(specialtyIds)) throw new AppError(400, 'BAD_REQUEST', 'specialtyIds array is required');
      const result = await clinicService.updateSpecialties(req.user!.userId, specialtyIds);
      res.json({ message: 'Specialties updated successfully', data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const clinicController = new ClinicController();
