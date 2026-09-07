import { IsOptional, IsUUID, IsString, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { CareStage, JourneyStatus } from '@prisma/client';

export class JourneyFilterDto extends PaginationQueryDto {
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  diagnosisCategory?: string;

  @IsEnum(CareStage)
  @IsOptional()
  careStage?: CareStage;

  @IsEnum(JourneyStatus)
  @IsOptional()
  status?: JourneyStatus;

  @IsUUID()
  @IsOptional()
  primaryDoctorId?: string;
}
