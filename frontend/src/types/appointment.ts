export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId?: string;
  appointmentType: string;
  scheduledAt: string;
  durationMinutes?: number;
  status: AppointmentStatus;
  room?: string;
  checkInAt?: string;
  consultationStartAt?: string;
  consultationEndAt?: string;
  waitingDurationMinutes?: number;
  cancellationReason?: string;
  notes?: string;
  patient?: any;
  doctor?: any;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  departmentId?: string;
  appointmentType: string;
  scheduledAt: string;
  durationMinutes?: number;
  room?: string;
  notes?: string;
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {
  status?: AppointmentStatus;
  cancellationReason?: string;
}

export interface AppointmentFilter {
  doctorId?: string;
  departmentId?: string;
  status?: AppointmentStatus;
  date?: string;
  type?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available?: boolean;
  isAvailable?: boolean;
}
