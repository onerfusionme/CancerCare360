export enum InvestigationStatus {
  ORDERED = 'ORDERED',
  SCHEDULED = 'SCHEDULED',
  SAMPLE_COLLECTED = 'SAMPLE_COLLECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  REPORT_AVAILABLE = 'REPORT_AVAILABLE',
  REVIEWED = 'REVIEWED',
  CANCELLED = 'CANCELLED'
}
export enum InvestigationType {
  BLOOD_WORK = 'BLOOD_WORK',
  IMAGING = 'IMAGING',
  BIOPSY = 'BIOPSY',
  GENETIC_TEST = 'GENETIC_TEST',
  OTHER = 'OTHER'
}
export interface Investigation {
  id: string;
  patientId: string;
  journeyId: string;
  type: InvestigationType;
  status: InvestigationStatus;
  orderedBy: string;
  orderedDate: string;
  scheduledDate?: string;
  collectedDate?: string;
  reportDate?: string;
  reviewedDate?: string;
  turnaroundTimeDays?: number;
  notes?: string;
  documentId?: string;
  patient?: any;
}
export interface CreateInvestigationDto {
  patientId: string;
  journeyId: string;
  type: InvestigationType;
  scheduledDate?: string;
  notes?: string;
}
export interface UpdateInvestigationDto {
  status?: InvestigationStatus;
  notes?: string;
}
export interface InvestigationFilter {
  patientId?: string;
  type?: InvestigationType;
  status?: InvestigationStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
