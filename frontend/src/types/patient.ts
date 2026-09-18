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

export enum PatientFollowUpStage {
  UNDER_TREATMENT = 'UNDER_TREATMENT',
  AWAITING_TREATMENT = 'AWAITING_TREATMENT',
  UNDER_FOLLOW_UP = 'UNDER_FOLLOW_UP',
  SURVEILLANCE = 'SURVEILLANCE',
  REQUIRING_INVESTIGATION = 'REQUIRING_INVESTIGATION',
  REQUIRING_REVIEW = 'REQUIRING_REVIEW',
  AT_RISK_LTFU = 'AT_RISK_LTFU',
  RE_ENGAGED = 'RE_ENGAGED',
  LOST_TO_FOLLOW_UP = 'LOST_TO_FOLLOW_UP',
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO format
  gender: Gender;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  status: PatientStatus;
  careStage: string;
  followUpStage?: PatientFollowUpStage | string;
  careCoordinatorId?: string;
  careCoordinator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reEngagedAt?: string;
  reEngagementNotes?: string;
  primaryDoctorId?: string;
  primaryDoctorName?: string;
  diagnosis?: string;
  lastVisit?: string;
  address?: string;
  languagePreference?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  careJourneys?: Array<{ id?: string; diagnosisCategory?: string; careStage?: string }>;
  barriers?: any[];
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
