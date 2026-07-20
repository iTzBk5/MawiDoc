import prisma from '../../shared/database';

export class SearchService {
  async searchDoctors(query: { name?: string; specialty?: string; specialtyId?: string; city?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.name) {
      where.fullName = { contains: query.name, mode: 'insensitive' };
    }

    if (query.specialtyId) {
      where.specialtyId = query.specialtyId;
    } else if (query.specialty) {
      where.specialty = {
        OR: [
          { name: { contains: query.specialty, mode: 'insensitive' } },
          { nameAr: { contains: query.specialty, mode: 'insensitive' } },
          { nameFr: { contains: query.specialty, mode: 'insensitive' } },
        ],
      };
    }

    if (query.city) {
      where.address = { contains: query.city, mode: 'insensitive' };
    }

    const [doctors, total] = await Promise.all([
      prisma.doctorProfile.findMany({
        where,
        include: { specialty: true, photos: true },
        orderBy: { fullName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.doctorProfile.count({ where }),
    ]);

    return {
      data: doctors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async searchClinics(query: { name?: string; specialtyId?: string; city?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }

    if (query.specialtyId) {
      where.specialties = {
        some: { id: query.specialtyId }
      };
    }

    if (query.city) {
      where.address = { contains: query.city, mode: 'insensitive' };
    }

    const [clinics, total] = await Promise.all([
      prisma.clinicProfile.findMany({
        where,
        include: { specialties: true, photos: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.clinicProfile.count({ where }),
    ]);

    return {
      data: clinics,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getNearbyDoctors(lat: number, lng: number, radiusKm: number = 10) {
    // Using simple Haversine-like filtering via Prisma raw query
    // For production, consider PostGIS extension
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        isOpen: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: { specialty: true },
    });

    // Filter by distance in JS (simple Haversine)
    const filtered = doctors.filter((doc: { latitude: number | null; longitude: number | null }) => {
      if (!doc.latitude || !doc.longitude) return false;
      const distance = this.haversineDistance(lat, lng, doc.latitude, doc.longitude);
      return distance <= radiusKm;
    });

    // Sort by distance
    filtered.sort((a: { latitude: number | null; longitude: number | null }, b: { latitude: number | null; longitude: number | null }) => {
      const distA = this.haversineDistance(lat, lng, a.latitude!, a.longitude!);
      const distB = this.haversineDistance(lat, lng, b.latitude!, b.longitude!);
      return distA - distB;
    });

    return filtered;
  }

  async getSpecialties() {
    return prisma.specialty.findMany({ orderBy: { name: 'asc' } });
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const searchService = new SearchService();
