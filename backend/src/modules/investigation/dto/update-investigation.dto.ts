import { PartialType } from '@nestjs/swagger';
import { CreateInvestigationDto } from './create-investigation.dto';
import { IsEnum, IsOptional, IsISO8601, IsString, IsUUID } from 'class-validator';
import { InvestigationStatus } from '@prisma/client';

export class UpdateInvestigationDto extends PartialType(CreateInvestigationDto) {
  @IsEnum(InvestigationStatus)
  @IsOptional()
  status?: InvestigationStatus;

  @IsISO8601()
  @IsOptional()
  performedAt?: string;

  @IsISO8601()
  @IsOptional()
  reportGeneratedAt?: string;

  @IsISO8601()
  @IsOptional()
  reportAvailableAt?: string;

  @IsISO8601()
  @IsOptional()
  reviewedAt?: string;

  @IsString()
  @IsOptional()
  resultSummary?: string;

  @IsUUID()
  @IsOptional()
  relatedDocumentId?: string;
}
