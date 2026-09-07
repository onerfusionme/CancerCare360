export enum ReviewStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  MODIFIED = 'MODIFIED'
}

export enum AiCapability {
  DOCUMENT_EXTRACTION = 'DOCUMENT_EXTRACTION',
  CONSULTATION_SUMMARY = 'CONSULTATION_SUMMARY',
  SINCE_LAST_VISIT = 'SINCE_LAST_VISIT',
  CARE_GAP_EXPLANATION = 'CARE_GAP_EXPLANATION',
  COMMUNICATION_DRAFT = 'COMMUNICATION_DRAFT'
}

export interface AiInteractionLog {
  id: string;
  tenantId: string;
  userId: string;
  capability: AiCapability;
  modelProvider: string;
  inputContextRef?: string;
  output: any;
  confidenceScore: number;
  reviewedById?: string;
  reviewStatus?: ReviewStatus;
  reviewNotes?: string;
  createdAt: string;
  user?: { name: string; email: string };
  reviewedBy?: { name: string; email: string };
}

export interface AiExtractionResult {
  entities: Record<string, any>;
  confidenceScores: Record<string, number>;
  documentType: string;
  clinicalDisclaimer: string;
}

export interface AiConsultationSummary {
  clinicalTrajectory: string;
  currentStatus: string;
  attentionPoints: string[];
  pendingInvestigations: string[];
  recommendedAgenda: string[];
  confidenceScore: number;
  clinicalDisclaimer: string;
}

export interface AiGapExplanation {
  gapType: string;
  summary: string;
  rootCauseReasoning: string;
  suggestedAction: string;
  clinicalUrgency: string;
}

export interface AiEducationDraft {
  topic: string;
  language: string;
  draftContent: string;
  readingLevel: string;
  clinicalDisclaimer: string;
}

export interface AiGovernanceStats {
  totalInteractions: number;
  acceptedCount: number;
  rejectedCount: number;
  modifiedCount: number;
  averageConfidence: number;
}
