import { IsUUID, IsString, IsOptional, IsISO8601 } from 'class-validator';

export class CreateInvestigationDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @IsString()
  investigationType: string;

  @IsISO8601()
  @IsOptional()
  orderedAt?: string;

  @IsISO8601()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
