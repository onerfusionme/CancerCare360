import { PartialType } from '@nestjs/swagger';
import { CreateMilestoneDto } from './create-milestone.dto';
import { IsEnum, IsOptional, IsISO8601 } from 'class-validator';
import { MilestoneStatus } from '@prisma/client';

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {
  @IsEnum(MilestoneStatus)
  @IsOptional()
  status?: MilestoneStatus;

  @IsISO8601()
  @IsOptional()
  actualDate?: string;
}
