export interface CareGapRule {
  id: string;
  ruleType: string;
  conditions: any;
  priorityWeight: number;
  isActive: boolean;
}

export interface CareGap {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  gapType: string;
  description: string;
  priorityScore: number;
  detectedAt: string;
}

export interface CreateRuleDto {
  ruleType: string;
  conditions: any;
  priorityWeight: number;
  isActive: boolean;
}
