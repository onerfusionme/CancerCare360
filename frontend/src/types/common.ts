export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  settings: Record<string, any>;
}

export interface Hospital {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string;
  isPrimary: boolean;
}

export interface Department {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  clinical: boolean;
}
