export interface Specialty {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  icon: string | null;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  specialtyId: string;
  specialty?: Specialty;
  clinicName: string | null;
  address: string | null;
  description: string | null;
  consultationPrice: number;
  profilePicture: string | null;
  latitude: number | null;
  longitude: number | null;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateDoctorRequest {
  fullName?: string;
  clinicName?: string;
  address?: string;
  description?: string;
  consultationPrice?: number;
  profilePicture?: string;
  specialtyId?: string;
}

export interface UpdateDoctorLocationRequest {
  latitude: number;
  longitude: number;
}
