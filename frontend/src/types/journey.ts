export enum CareStage {
  SCREENING = 'SCREENING',
  DIAGNOSIS = 'DIAGNOSIS',
  TUMOR_BOARD = 'TUMOR_BOARD',
  TREATMENT_PLANNING = 'TREATMENT_PLANNING',
  ACTIVE_TREATMENT = 'ACTIVE_TREATMENT',
  FOLLOW_UP = 'FOLLOW_UP',
  SURVIVORSHIP = 'SURVIVORSHIP',
  PALLIATIVE = 'PALLIATIVE',
  END_OF_LIFE = 'END_OF_LIFE'
}

export enum EventType {
  CONSULTATION = 'CONSULTATION',
  INVESTIGATION = 'INVESTIGATION',
  IMAGING = 'IMAGING',
  BIOPSY = 'BIOPSY',
  SURGERY = 'SURGERY',
  CHEMOTHERAPY = 'CHEMOTHERAPY',
  RADIOTHERAPY = 'RADIOTHERAPY',
  TUMOR_BOARD_REVIEW = 'TUMOR_BOARD_REVIEW',
  ADMISSION = 'ADMISSION',
  DISCHARGE = 'DISCHARGE',
  FOLLOW_UP = 'FOLLOW_UP'
}

export enum EventStatus {
  COMPLETED = 'COMPLETED',
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  MISSED = 'MISSED',
  RESCHEDULED = 'RESCHEDULED'
}

export interface JourneyEvent {
  id: string;
  patientId: string;
  eventType: EventType;
  title: string;
  description?: string;
  date: string;
  status: EventStatus;
  providerId?: string;
  providerName?: string;
  departmentId?: string;
  notes?: string;
  documentIds?: string[];
  createdAt: string;
}

export enum MilestoneType {
  DIAGNOSIS_CONFIRMED = 'DIAGNOSIS_CONFIRMED',
  TREATMENT_STARTED = 'TREATMENT_STARTED',
  TREATMENT_COMPLETED = 'TREATMENT_COMPLETED',
  REMISSION = 'REMISSION',
  RELAPSE = 'RELAPSE'
}

export enum MilestoneStatus {
  ACHIEVED = 'ACHIEVED',
  EXPECTED = 'EXPECTED',
  DELAYED = 'DELAYED'
}

export interface CareMilestone {
  id: string;
  patientId: string;
  type: MilestoneType;
  title: string;
  date: string;
  status: MilestoneStatus;
}

export interface CareJourney {
  patientId: string;
  currentStage: CareStage;
  events: JourneyEvent[];
  milestones: CareMilestone[];
  startDate: string;
}
