import { Investigation } from './investigation';
import { CareMilestone } from './milestone';
import { Document } from './document';

export interface ReadinessScore {
  score: number; // 0 - 100
  status: 'READY_FOR_CONSULTATION' | 'CONDITIONAL_READY' | 'NOT_READY_PENDING_DIAGNOSTICS';
  breakdown: {
    diagnostic: number; // max 35
    vitalsAndPerformance: number; // max 25
    careGapClearance: number; // max 25
    encounterReadiness: number; // max 15
  };
  missingPrerequisites: string[];
}

export interface IntervalToxicity {
  symptom: string;
  grade: number; // 0 - 4
  action: string;
}

export interface SinceLastVisit {
  lastVisitDate: string | null;
  newInvestigations: any[];
  newDocuments: Document[];
  treatmentEvents: any[];
  missedAppointments: any[];
  newEvents: any[];
  intervalToxicities?: IntervalToxicity[];
}

export interface PendingItems {
  investigations: any[];
  milestones: CareMilestone[];
  followUpTasks: any[];
}

export interface ConsultationReadiness {
  patient: any;
  currentJourney: any;
  readinessScore: ReadinessScore;
  ecogScore?: number;
  sinceLastVisit: SinceLastVisit;
  pending: PendingItems;
  pendingItems: PendingItems;
  barriers?: any[];
  recentHistory: {
    lastConsultations: any[];
    recentDocuments: Document[];
  };
  nextSteps: {
    upcomingMilestones: CareMilestone[];
    upcomingAppointments: any[];
  };
}

export interface StatInvestigationInput {
  investigationType: string;
  notes?: string;
  isUrgent?: boolean;
}

export interface FinalizeConsultationInput {
  clinicalAssessment: string;
  diseaseResponse?: string;
  treatmentPlan: string;
  ecogScore?: number;
  toxicities?: Array<{ symptom: string; grade: number; notes?: string }>;
  nextFollowUpDate?: string;
  nextMilestoneType?: string;
}
