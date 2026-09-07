import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { TaskStatus } from './update-task.dto';
import { TaskType, TaskPriority } from './create-task.dto';
import { Transform } from 'class-transformer';

export class TaskFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus | string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority | string;

  @ApiPropertyOptional({ enum: TaskType })
  @IsEnum(TaskType)
  @IsOptional()
  taskType?: TaskType | string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  dueDateFrom?: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  dueDateTo?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  overdue?: boolean;
}
