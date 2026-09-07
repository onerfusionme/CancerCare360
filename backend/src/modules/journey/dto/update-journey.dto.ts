import { PartialType } from '@nestjs/swagger';
import { CreateJourneyDto } from './create-journey.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { JourneyStatus } from '@prisma/client';

export class UpdateJourneyDto extends PartialType(CreateJourneyDto) {
  @IsEnum(JourneyStatus)
  @IsOptional()
  status?: JourneyStatus;
}
