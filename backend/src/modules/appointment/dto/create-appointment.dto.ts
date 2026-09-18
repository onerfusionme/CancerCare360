import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export enum AppointmentType {
  CONSULTATION = 'Consultation',
  FOLLOW_UP = 'Follow-up',
  TREATMENT = 'Treatment',
  INVESTIGATION = 'Investigation',
  MDT_MEETING = 'MDT Meeting',
}

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @ApiProperty()
  @IsUUID()
  doctorId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ default: 'Consultation' })
  @IsString()
  appointmentType: string;

  @ApiProperty()
  @IsISO8601()
  scheduledAt: string;

  @ApiPropertyOptional({ default: 30 })
  @IsInt()
  @IsOptional()
  durationMinutes?: number = 30;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
