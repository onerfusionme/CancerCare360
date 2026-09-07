export enum CommunicationChannel {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP'
}

export enum OutreachOutcome {
  REACHED = 'REACHED',
  LEFT_MESSAGE = 'LEFT_MESSAGE',
  NO_ANSWER = 'NO_ANSWER',
  INVALID_NUMBER = 'INVALID_NUMBER',
  OPT_OUT = 'OPT_OUT'
}

export interface OutreachLog {
  id: string;
  patientId: string;
  taskId?: string;
  channel: CommunicationChannel;
  outcome: OutreachOutcome;
  contactedAt: string;
  contactedById: string;
  notes?: string;
  nextAction?: string;
  nextFollowUpDate?: string;
  patient?: any;
  task?: any;
  contactedBy?: any;
}

export interface CreateOutreachDto {
  patientId: string;
  taskId?: string;
  channel: CommunicationChannel;
  outcome: OutreachOutcome;
  notes?: string;
  nextAction?: string;
  nextFollowUpDate?: string;
}

export interface ContactSummary {
  totalAttempts: number;
  lastContactedAt?: string;
  lastOutcome?: OutreachOutcome;
}
