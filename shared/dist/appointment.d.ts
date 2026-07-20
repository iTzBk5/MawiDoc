export declare enum AppointmentStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    slotId: string | null;
    date: Date;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface AvailableSlot {
    id: string;
    doctorId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}
export interface BookAppointmentRequest {
    doctorId: string;
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}
export interface CreateManualAppointmentRequest {
    patientId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}
export interface AppointmentWithDetails extends Appointment {
    patient?: {
        id: string;
        fullName: string;
        phone: string;
        age: number;
        gender: string;
        city: string;
    };
    doctor?: {
        id: string;
        fullName: string;
        clinicName: string | null;
        specialty?: {
            name: string;
            nameAr: string;
        };
    };
}
export interface Statistics {
    totalAppointments: number;
    todayAppointments: number;
    monthlyAppointments: number;
    cancelledAppointments: number;
    totalPatients: number;
}
