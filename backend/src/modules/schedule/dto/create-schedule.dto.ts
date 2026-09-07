import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty()
  @IsUUID()
  doctorId: string;

  @ApiProperty()
  @IsUUID()
  departmentId: string;

  @ApiProperty({ minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ default: 15 })
  @IsInt()
  @IsOptional()
  slotDurationMinutes?: number = 15;

  @ApiProperty()
  @IsInt()
  maxPatients: number;

  @ApiProperty()
  @IsISO8601()
  effectiveFrom: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  effectiveTo?: string;
}
