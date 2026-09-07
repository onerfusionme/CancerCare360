import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export enum TaskType {
  FOLLOW_UP_CALL = 'FOLLOW_UP_CALL',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  INVESTIGATION_FOLLOW_UP = 'INVESTIGATION_FOLLOW_UP',
  TREATMENT_FOLLOW_UP = 'TREATMENT_FOLLOW_UP',
  DOCUMENTATION_REQUEST = 'DOCUMENTATION_REQUEST',
  CARE_GAP_FOLLOW_UP = 'CARE_GAP_FOLLOW_UP',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTaskDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @ApiProperty({ enum: TaskType })
  @IsEnum(TaskType)
  taskType: TaskType | string;

  @ApiProperty({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  priority: TaskPriority | string;

  @ApiProperty()
  @IsString()
  issueDescription: string;

  @ApiProperty()
  @IsISO8601()
  dueDate: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}
