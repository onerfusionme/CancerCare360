export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCHARGED = 'DISCHARGED',
  DECEASED = 'DECEASED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN'
}

export interface PatientIdentifier {
  type: 'MRN' | 'AADHAAR' | 'PAN' | 'PASSPORT' | 'OTHER';
  value: string;
  isPrimary: boolean;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO format
  gender: Gender;
  phoneNumber?: string;
  email?: string;
  status: PatientStatus;
  careStage: string;
  primaryDoctorId?: string;
  primaryDoctorName?: string;
  diagnosis?: string;
  lastVisit?: string;
  address?: string;
  languagePreference?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: PatientStatus;
  gender?: Gender;
  departmentId?: string;
  doctorId?: string;
  careStage?: string;
  isOverdue?: boolean;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  mrn?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  languagePreference?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  status?: PatientStatus;
  primaryDoctorId?: string;
  primaryDoctorName?: string;
  careStage?: string;
}
