export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ'
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  bodyTemplate: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  templateId?: string;
  channel: string;
  subject?: string;
  body: string;
  status: NotificationStatus;
  sentAt?: string;
  readAt?: string;
}

export interface CreateTemplateDto {
  name: string;
  channel: string;
  subject?: string;
  bodyTemplate: string;
}

export interface SendNotificationDto {
  recipientId: string;
  templateId?: string;
  channel: string;
  subject?: string;
  body?: string;
  variables?: any;
}

export interface DeliveryStats {
  sent: number;
  failed: number;
  read: number;
}
