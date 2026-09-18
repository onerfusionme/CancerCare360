import { IsUUID, IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { BarrierCategory, InterventionType, BarrierStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBarrierDto {
  @ApiProperty({ description: 'UUID of the patient' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ description: 'Related follow-up task ID' })
  @IsUUID()
  @IsOptional()
  taskId?: string;

  @ApiPropertyOptional({ description: 'Related outreach log ID' })
  @IsUUID()
  @IsOptional()
  outreachLogId?: string;

  @ApiProperty({ enum: BarrierCategory, description: 'Core category of continuity barrier' })
  @IsEnum(BarrierCategory)
  category: BarrierCategory;

  @ApiProperty({ description: 'Detailed description of the barrier reported or observed' })
  @IsString()
  barrierDetail: string;

  @ApiPropertyOptional({ description: 'Whether the barrier is hospital/system side vs patient side' })
  @IsBoolean()
  @IsOptional()
  isHospitalSide?: boolean;

  @ApiPropertyOptional({ description: 'Who reported the barrier (PATIENT, FAMILY, COORDINATOR, CLINICIAN)' })
  @IsString()
  @IsOptional()
  reportedBy?: string;

  @ApiPropertyOptional({ enum: InterventionType, description: 'Intervention planned or applied' })
  @IsEnum(InterventionType)
  @IsOptional()
  interventionType?: InterventionType;

  @ApiPropertyOptional({ description: 'Clinical or operational intervention notes' })
  @IsString()
  @IsOptional()
  interventionNotes?: string;

  @ApiPropertyOptional({ enum: BarrierStatus, description: 'Current status of the barrier' })
  @IsEnum(BarrierStatus)
  @IsOptional()
  status?: BarrierStatus;
}
