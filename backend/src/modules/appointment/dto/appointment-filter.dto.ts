import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { AppointmentStatus } from './update-appointment.dto';
import { AppointmentType } from './create-appointment.dto';

export class AppointmentFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus | string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ enum: AppointmentType })
  @IsEnum(AppointmentType)
  @IsOptional()
  appointmentType?: AppointmentType | string;
}
