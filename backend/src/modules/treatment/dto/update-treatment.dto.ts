import { PartialType } from '@nestjs/swagger';
import { CreateTreatmentDto } from './create-treatment.dto';
import { IsEnum, IsOptional, IsISO8601 } from 'class-validator';
import { TreatmentStatus } from '@prisma/client';

export class UpdateTreatmentDto extends PartialType(CreateTreatmentDto) {
  @IsEnum(TreatmentStatus)
  @IsOptional()
  status?: TreatmentStatus;

  @IsISO8601()
  @IsOptional()
  actualDate?: string;
}
