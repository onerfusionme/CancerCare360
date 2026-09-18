export enum BarrierCategory {
  COMMUNICATION = 'COMMUNICATION',
  TRANSPORTATION = 'TRANSPORTATION',
  FINANCIAL = 'FINANCIAL',
  FAMILY_CAREGIVER = 'FAMILY_CAREGIVER',
  WORK_SCHEDULE = 'WORK_SCHEDULE',
  UNDERSTANDING_HEALTH_LITERACY = 'UNDERSTANDING_HEALTH_LITERACY',
  HOSPITAL_PROCESS = 'HOSPITAL_PROCESS',
  OTHER = 'OTHER',
}

export enum InterventionType {
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  FINANCIAL_AID_REFERRAL = 'FINANCIAL_AID_REFERRAL',
  TRANSPORT_ASSISTANCE = 'TRANSPORT_ASSISTANCE',
  SOCIAL_WORK_REFERRAL = 'SOCIAL_WORK_REFERRAL',
  LANGUAGE_INTERPRETER = 'LANGUAGE_INTERPRETER',
  CAREGIVER_COUNSELING = 'CAREGIVER_COUNSELING',
  HOSPITAL_ESCORT = 'HOSPITAL_ESCORT',
  DOCTOR_TELECONSULT_CALLBACK = 'DOCTOR_TELECONSULT_CALLBACK',
  PATIENT_EDUCATION = 'PATIENT_EDUCATION',
  OTHER = 'OTHER',
}

export enum BarrierStatus {
  IDENTIFIED = 'IDENTIFIED',
  INTERVENTION_PLANNED = 'INTERVENTION_PLANNED',
  INTERVENTION_ACTIVE = 'INTERVENTION_ACTIVE',
  RESOLVED = 'RESOLVED',
  UNRESOLVED = 'UNRESOLVED',
}

export interface PatientBarrier {
  id: string;
  tenantId: string;
  patientId: string;
  taskId?: string | null;
  outreachLogId?: string | null;
  category: BarrierCategory;
  barrierDetail: string;
  isHospitalSide: boolean;
  reportedBy: string;
  interventionType: InterventionType;
  interventionNotes?: string | null;
  status: BarrierStatus;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
}

export interface TaskHandoff {
  id: string;
  taskId: string;
  fromUserId: string;
  toUserId?: string;
  fromRole: string;
  toRole: string;
  reason: string;
  notes?: string;
  handoffDate: string;
}

export interface CommandCenterMetrics {
  totalRequiringAttention: number;
  criticalCount: number;
  overdueCount: number;
  dueTodayCount: number;
  missedApptsCount: number;
  noFutureApptCount: number;
  stalledOutreachCount: number;
  escalatedCount: number;
  recoveredCount: number;
}

export interface CommandCenterTask {
  id: string;
  patientId: string;
  taskType: string;
  careGapType?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  priorityScore: number;
  priorityReason: string;
  issueDescription: string;
  nextAction?: string;
  lastAction?: string;
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  escalationLevel: number;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
    cancerType?: string;
    cancerStage?: string;
    followUpStage: string;
    careCoordinatorId?: string;
    phone?: string;
    careJourneys?: Array<{ diagnosisCategory?: string; careStage?: string }>;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userRoles?: Array<{ role: { name: string } }>;
  };
  barriers: PatientBarrier[];
  handoffs: TaskHandoff[];
  outreachLogs?: Array<{
    id: string;
    channel: string;
    outcome: string;
    notes?: string;
    contactDate: string;
  }>;
}

export interface CreateBarrierInput {
  patientId: string;
  taskId?: string;
  outreachLogId?: string;
  category: BarrierCategory;
  barrierDetail: string;
  isHospitalSide?: boolean;
  reportedBy?: string;
  interventionType?: InterventionType;
  interventionNotes?: string;
}

export interface UpdateBarrierInput {
  interventionType?: InterventionType;
  interventionNotes?: string;
  status?: BarrierStatus;
}

export interface ResolveBarrierInput {
  resolutionNotes?: string;
  recoveredAppointmentId?: string;
}

export interface TaskHandoffInput {
  toUserId?: string;
  toRole: string;
  reason: string;
  notes?: string;
}

export interface RecoverAppointmentInput {
  newAppointmentDate: string;
  departmentId?: string;
  doctorId?: string;
  notes?: string;
  barrierIdToResolve?: string;
}

export interface BarrierAnalytics {
  totalBarriers: number;
  resolvedBarriers: number;
  activeBarriers: number;
  resolutionRate: number;
  hospitalSideCount: number;
  patientSideCount: number;
  byCategory: Record<string, number>;
  byIntervention: Record<string, number>;
}

export interface OperationalBottlenecks {
  summary: {
    totalHospitalSide: number;
    totalPatientSide: number;
    ratio: string;
  };
  hospitalBottlenecks: PatientBarrier[];
  patientBarriers: PatientBarrier[];
}
