import { IsUUID, IsEnum, IsOptional, IsISO8601, IsInt, IsString } from 'class-validator';
import { TreatmentType } from '@prisma/client';

export class CreateTreatmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @IsEnum(TreatmentType)
  treatmentType: TreatmentType;

  @IsInt()
  @IsOptional()
  cycleNumber?: number;

  @IsISO8601()
  @IsOptional()
  plannedDate?: string;

  @IsISO8601()
  @IsOptional()
  scheduledDate?: string;

  @IsUUID()
  @IsOptional()
  responsibleTeamId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
