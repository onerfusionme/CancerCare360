export enum UserRole {
  ONCOLOGIST = 'ONCOLOGIST',
  MEDICAL_ONCOLOGIST = 'MEDICAL_ONCOLOGIST',
  RADIATION_ONCOLOGIST = 'RADIATION_ONCOLOGIST',
  SURGICAL_ONCOLOGIST = 'SURGICAL_ONCOLOGIST',
  PATHOLOGIST = 'PATHOLOGIST',
  RADIOLOGIST = 'RADIOLOGIST',
  NURSE = 'NURSE',
  CARE_COORDINATOR = 'CARE_COORDINATOR',
  SOCIAL_WORKER = 'SOCIAL_WORKER',
  DIETICIAN = 'DIETICIAN',
  PSYCHOLOGIST = 'PSYCHOLOGIST',
  HOD = 'HOD',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  tenantId: string;
  departmentId?: string;
  phoneNumber?: string;
  isActive: boolean;
  profileImageUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}
