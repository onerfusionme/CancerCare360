import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AidOrgCategory } from '@prisma/client';

export class CreateSchemeDto {
  @ApiProperty({ description: 'Scheme or Trust Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Regional / Local language name' })
  @IsOptional()
  @IsString()
  nameRegional?: string;

  @ApiProperty({ enum: AidOrgCategory, description: 'Category of aid organization' })
  @IsEnum(AidOrgCategory)
  category: AidOrgCategory;

  @ApiProperty({ description: 'Parent organization, trust, or committee name' })
  @IsNotEmpty()
  @IsString()
  organizationName: string;

  @ApiPropertyOptional({ description: 'Maximum aid / grant amount in INR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxGrantAmount?: number;

  @ApiProperty({ description: 'Summary of medical aid benefits' })
  @IsNotEmpty()
  @IsString()
  benefitDescription: string;

  @ApiPropertyOptional({ description: 'Annual family income ceiling in INR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  incomeLimitAnnual?: number;

  @ApiPropertyOptional({ description: 'Eligible ration cards (e.g. Yellow, Orange, All)' })
  @IsOptional()
  @IsString()
  eligibleRationCards?: string;

  @ApiPropertyOptional({ description: 'Eligible hospitals (e.g. Govt, BMC, Empaneled Private)' })
  @IsOptional()
  @IsString()
  eligibleHospitals?: string;

  @ApiPropertyOptional({ description: 'Official website / portal link' })
  @IsOptional()
  @IsString()
  officialPortalUrl?: string;

  @ApiPropertyOptional({ description: 'Helpline / Support phone number' })
  @IsOptional()
  @IsString()
  helplineNumber?: string;

  @ApiPropertyOptional({ description: 'Physical office address for application submission' })
  @IsOptional()
  @IsString()
  physicalAddress?: string;

  @ApiProperty({ description: 'Detailed step-by-step application procedure' })
  @IsNotEmpty()
  @IsString()
  stepByStepProcedure: string;

  @ApiProperty({ description: 'List of mandatory documents required', type: [String] })
  @IsArray()
  requiredDocuments: string[];

  @ApiPropertyOptional({ description: 'Estimated processing turnaround in days', default: 14 })
  @IsOptional()
  @IsNumber()
  processingDays?: number;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSchemeDto extends PartialType(CreateSchemeDto) {}
