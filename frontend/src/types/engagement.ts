export type ContentStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface EducationContent {
  id: string;
  title: string;
  category: string;
  language: string; // 'en' | 'hi' | 'mr'
  body: string;
  version: string;
  status: ContentStatus;
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignType = 'SCREENING' | 'AWARENESS' | 'VACCINATION' | 'FOLLOW_UP_REMINDER';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type DeliveryStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  channel: string; // 'WhatsApp' | 'SMS' | 'Email' | 'Portal'
  audienceCriteria: Record<string, any>;
  approvalStatus: ApprovalStatus;
  deliveryStatus: DeliveryStatus;
  scheduledDate?: string;
  linkedContentId?: string;
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    clicked: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PatientPreferences {
  preferredLanguage: string;
  communicationPreferences: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  abhaId?: string;
}

export interface ConsentArtefact {
  id: string;
  purpose: string;
  validUntil: string;
  status: 'ACTIVE' | 'REVOKED';
  scope: string[];
}
