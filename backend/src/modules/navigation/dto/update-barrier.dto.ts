import { IsEnum, IsString, IsOptional } from 'class-validator';
import { InterventionType, BarrierStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBarrierDto {
  @ApiPropertyOptional({ enum: InterventionType })
  @IsEnum(InterventionType)
  @IsOptional()
  interventionType?: InterventionType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  interventionNotes?: string;

  @ApiPropertyOptional({ enum: BarrierStatus })
  @IsEnum(BarrierStatus)
  @IsOptional()
  status?: BarrierStatus;
}

export class ResolveBarrierDto {
  @ApiPropertyOptional({ description: 'Resolution notes or outcome' })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;

  @ApiPropertyOptional({ description: 'Optional new appointment ID booked to recover the patient' })
  @IsString()
  @IsOptional()
  recoveredAppointmentId?: string;
}
