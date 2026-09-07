import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum TemplateType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  INVESTIGATION_READY = 'INVESTIGATION_READY',
  FOLLOW_UP_REMINDER = 'FOLLOW_UP_REMINDER',
  CARE_GAP_ALERT = 'CARE_GAP_ALERT',
  MEDICATION_REMINDER = 'MEDICATION_REMINDER',
  CAMPAIGN = 'CAMPAIGN',
}

export enum NotificationChannel {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  PORTAL = 'PORTAL',
}

export class CreateTemplateDto {
  @ApiProperty({ enum: TemplateType })
  @IsEnum(TemplateType)
  templateType: TemplateType | string;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel | string;

  @ApiPropertyOptional({ default: 'en' })
  @IsString()
  @IsOptional()
  language?: string = 'en';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty()
  @IsString()
  bodyTemplate: string;
}
