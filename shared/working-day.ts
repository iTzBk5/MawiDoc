export interface WorkingDay {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
}

export interface UpdateWorkingDaysRequest {
  days: {
    dayOfWeek: number;
    isActive: boolean;
    startTime: string;
    endTime: string;
  }[];
}
