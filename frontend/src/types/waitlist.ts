export enum WaitlistPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum WaitlistStatus {
  WAITING = 'WAITING',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED'
}

export interface WaitlistEntry {
  id: string;
  patientId: string;
  departmentId: string;
  preferredDoctorId?: string;
  preferredDate?: string;
  priority: WaitlistPriority;
  status: WaitlistStatus;
  notes?: string;
  patient?: any;
  department?: any;
  preferredDoctor?: any;
}

export interface CreateWaitlistDto {
  patientId: string;
  departmentId: string;
  preferredDoctorId?: string;
  preferredDate?: string;
  priority: WaitlistPriority;
  notes?: string;
}
