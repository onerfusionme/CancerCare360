export enum TreatmentType {
  SURGERY = 'SURGERY',
  CHEMOTHERAPY = 'CHEMOTHERAPY',
  RADIATION = 'RADIATION',
  IMMUNOTHERAPY = 'IMMUNOTHERAPY',
  TARGETED_THERAPY = 'TARGETED_THERAPY',
  HORMONE_THERAPY = 'HORMONE_THERAPY'
}
export enum TreatmentStatus {
  PLANNED = 'PLANNED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED'
}
export interface TreatmentMilestone {
  id: string;
  patientId: string;
  journeyId: string;
  type: TreatmentType;
  status: TreatmentStatus;
  cycleNumber?: number;
  plannedDate: string;
  actualDate?: string;
  team: string;
  notes?: string;
}
export interface CreateTreatmentDto {
  patientId: string;
  journeyId: string;
  type: TreatmentType;
  cycleNumber?: number;
  plannedDate: string;
  team: string;
  notes?: string;
}
export interface UpdateTreatmentDto {
  status?: TreatmentStatus;
  actualDate?: string;
  notes?: string;
}
export interface TreatmentFilter {
  patientId?: string;
  type?: TreatmentType;
  status?: TreatmentStatus;
}
