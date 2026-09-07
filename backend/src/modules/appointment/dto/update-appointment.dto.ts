import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus | string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  checkInAt?: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  consultationStartAt?: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  consultationEndAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
