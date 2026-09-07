import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsJSON, IsNotEmpty, IsObject, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Gender, PatientStatus } from '@prisma/client';

export class CreatePatientDto {
  @ApiProperty({ example: 'MRN-12345' })
  @IsString()
  @IsNotEmpty()
  mrn: string;

  @ApiPropertyOptional({ example: 'ABHA-987654321' })
  @IsString()
  @IsOptional()
  abhaId?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1980-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ type: Object, description: 'Address JSON' })
  @IsObject()
  @IsOptional()
  address?: Record<string, any>;

  @ApiPropertyOptional({ type: Object, description: 'Emergency Contact JSON' })
  @IsObject()
  @IsOptional()
  emergencyContact?: Record<string, any>;

  @ApiPropertyOptional({ default: 'en' })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  communicationPreferences?: Record<string, any>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sourceSystem?: string;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  externalIds?: Record<string, any>;

  @ApiProperty({ enum: PatientStatus, default: PatientStatus.ACTIVE })
  @IsEnum(PatientStatus)
  @IsNotEmpty()
  status: PatientStatus;
}
