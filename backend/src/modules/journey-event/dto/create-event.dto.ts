import { IsUUID, IsEnum, IsOptional, IsISO8601, IsString, IsObject } from 'class-validator';
import { EventType, EventStatus } from '@prisma/client';

export class CreateEventDto {
  @IsUUID()
  journeyId: string;

  @IsUUID()
  patientId: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsISO8601()
  eventDate: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsUUID()
  @IsOptional()
  responsibleUserId?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  sourceSystem?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsUUID()
  @IsOptional()
  relatedDocumentId?: string;

  @IsUUID()
  @IsOptional()
  relatedAppointmentId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
