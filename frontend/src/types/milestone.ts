export enum MilestoneStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  CANCELLED = 'CANCELLED'
}
export interface CareMilestone {
  id: string;
  patientId: string;
  journeyId: string;
  type: string;
  expectedDate: string;
  actualDate?: string;
  status: MilestoneStatus;
  daysOverdue?: number;
  notes?: string;
}
export interface MilestoneTemplate {
  id: string;
  name: string;
  diagnosisCategory?: string;
  expectedDaysFromStart: number;
}
export interface CreateMilestoneDto {
  patientId: string;
  journeyId: string;
  type: string;
  expectedDate: string;
}
export interface CreateTemplateDto {
  name: string;
  diagnosisCategory?: string;
  expectedDaysFromStart: number;
}
