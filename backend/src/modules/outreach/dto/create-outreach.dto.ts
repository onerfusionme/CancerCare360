import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export enum OutreachChannel {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  IN_PERSON = 'IN_PERSON',
  PORTAL = 'PORTAL',
}

export enum OutreachOutcome {
  REACHED = 'REACHED',
  LEFT_MESSAGE = 'LEFT_MESSAGE',
  NO_ANSWER = 'NO_ANSWER',
  INVALID_NUMBER = 'INVALID_NUMBER',
  PATIENT_DECLINED = 'PATIENT_DECLINED',
  RESOLVED = 'RESOLVED',
}

export class CreateOutreachDto {
  @ApiProperty()
  @IsUUID()
  taskId: string;

  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  contactDate?: string;

  @ApiProperty({ enum: OutreachChannel })
  @IsEnum(OutreachChannel)
  channel: OutreachChannel | string;

  @ApiProperty({ enum: OutreachOutcome })
  @IsEnum(OutreachOutcome)
  outcome: OutreachOutcome | string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nextAction?: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  nextFollowUpDate?: string;
}
