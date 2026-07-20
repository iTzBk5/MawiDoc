import { Request, Response, NextFunction } from 'express';
import { searchService } from './search.service';

export class SearchController {
  async searchDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, specialty, specialtyId, city, page, limit } = req.query;
      const result = await searchService.searchDoctors({
        name: name as string,
        specialty: specialty as string,
        specialtyId: specialtyId as string,
        city: city as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async searchClinics(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, specialtyId, city, page, limit } = req.query;
      const result = await searchService.searchClinics({
        name: name as string,
        specialtyId: specialtyId as string,
        city: city as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getNearbyDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, radius } = req.query;
      const result = await searchService.getNearbyDoctors(
        Number(lat),
        Number(lng),
        radius ? Number(radius) : undefined
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getSpecialties(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await searchService.getSpecialties();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const searchController = new SearchController();
