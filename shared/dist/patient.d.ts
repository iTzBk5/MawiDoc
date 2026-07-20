import { Gender } from './user';
export interface PatientProfile {
    id: string;
    userId: string;
    fullName: string;
    username: string;
    age: number;
    gender: Gender;
    city: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UpdatePatientRequest {
    fullName?: string;
    age?: number;
    gender?: Gender;
    city?: string;
}
