import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export enum WaitlistPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateWaitlistDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiProperty()
  @IsUUID()
  departmentId: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  preferredDate?: string;

  @ApiProperty({ enum: WaitlistPriority })
  @IsEnum(WaitlistPriority)
  priority: WaitlistPriority | string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
