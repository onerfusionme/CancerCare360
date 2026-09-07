import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { TreatmentType, TreatmentStatus } from '@prisma/client';

export class TreatmentFilterDto extends PaginationQueryDto {
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @IsEnum(TreatmentType)
  @IsOptional()
  treatmentType?: TreatmentType;

  @IsEnum(TreatmentStatus)
  @IsOptional()
  status?: TreatmentStatus;
}
