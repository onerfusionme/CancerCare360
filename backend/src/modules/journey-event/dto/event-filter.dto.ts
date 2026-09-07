import { IsOptional, IsUUID, IsEnum, IsISO8601 } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { EventType, EventStatus } from '@prisma/client';

export class EventFilterDto extends PaginationQueryDto {
  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @IsUUID()
  @IsOptional()
  patientId?: string;

  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsISO8601()
  @IsOptional()
  dateFrom?: string;

  @IsISO8601()
  @IsOptional()
  dateTo?: string;
}
