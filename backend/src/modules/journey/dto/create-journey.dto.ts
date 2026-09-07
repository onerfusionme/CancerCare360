import { IsUUID, IsString, IsEnum, IsOptional, IsISO8601 } from 'class-validator';
import { CareStage } from '@prisma/client';

export class CreateJourneyDto {
  @IsUUID()
  patientId: string;

  @IsString()
  diagnosisCategory: string;

  @IsEnum(CareStage)
  careStage: CareStage;

  @IsUUID()
  primaryDoctorId: string;

  @IsUUID()
  @IsOptional()
  careTeamId?: string;

  @IsISO8601()
  startedAt: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
