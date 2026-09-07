export interface DoctorSchedule {
  id: string;
  doctorId: string;
  departmentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface CreateScheduleDto {
  doctorId: string;
  departmentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> {
  isActive?: boolean;
}
