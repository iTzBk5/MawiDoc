import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { appointmentService } from './appointment.service';
import { UserRole } from '@mawi-doc/shared';

export class AppointmentController {
  async bookAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await appointmentService.bookPatientAppointment(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createManual(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await appointmentService.createManualAppointment(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await appointmentService.acceptAppointment(req.user!.userId, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await appointmentService.rejectAppointment(req.user!.userId, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await appointmentService.cancelAppointment(req.user!.userId, req.user!.role, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getPatientAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = res.locals.validatedData || req.query;
      const result = await appointmentService.getPatientAppointments(req.user!.userId, query as any);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getDoctorAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = res.locals.validatedData || req.query;
      const result = await appointmentService.getDoctorAppointments(req.user!.userId, query as any);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

export const appointmentController = new AppointmentController();
