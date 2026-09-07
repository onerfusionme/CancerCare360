import { Investigation } from './investigation';
import { CareMilestone } from './milestone';
import { Document } from './document';

export interface ConsultationReadiness {
  patient: any;
  currentJourney: any;
  sinceLastVisit: SinceLastVisit;
  pendingItems: PendingItems;
  recentHistory: any;
  nextSteps: any;
}

export interface SinceLastVisit {
  lastVisitDate: string;
  newInvestigations: Investigation[];
  newDocuments: Document[];
  treatmentEvents: any[];
  missedAppointments: any[];
  newEvents: any[];
}

export interface PendingItems {
  investigations: Investigation[];
  milestones: CareMilestone[];
  followUpTasks: any[];
}
