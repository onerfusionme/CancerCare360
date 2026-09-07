import { IsOptional, IsUUID, IsEnum, IsISO8601, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { InvestigationStatus } from '@prisma/client';

export class InvestigationFilterDto extends PaginationQueryDto {
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @IsString()
  @IsOptional()
  investigationType?: string;

  @IsEnum(InvestigationStatus)
  @IsOptional()
  status?: InvestigationStatus;

  @IsISO8601()
  @IsOptional()
  dateFrom?: string;

  @IsISO8601()
  @IsOptional()
  dateTo?: string;
}
