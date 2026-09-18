import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEstimateDto {
  @ApiPropertyOptional({ description: 'Associated patient ID' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiProperty({ description: 'Patient full name' })
  @IsNotEmpty()
  @IsString()
  patientName: string;

  @ApiProperty({ description: 'Cancer diagnosis type' })
  @IsNotEmpty()
  @IsString()
  cancerType: string;

  @ApiPropertyOptional({ description: 'TNM stage or subsite' })
  @IsOptional()
  @IsString()
  cancerStage?: string;

  @ApiProperty({ description: 'Treating hospital name' })
  @IsNotEmpty()
  @IsString()
  hospitalName: string;

  @ApiProperty({ description: 'Treating consultant oncologist name' })
  @IsNotEmpty()
  @IsString()
  treatingDoctorName: string;

  @ApiPropertyOptional({ description: 'Medical council registration number' })
  @IsOptional()
  @IsString()
  treatingDoctorRegNo?: string;

  @ApiPropertyOptional({ description: 'Surgical resection & anesthesia cost in INR', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  surgeryCost?: number;

  @ApiPropertyOptional({ description: 'Chemotherapy cycles & premedication cost in INR', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  chemoCost?: number;

  @ApiPropertyOptional({ description: 'Radiation therapy fractions (IMRT/IGRT) cost in INR', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  radiationCost?: number;

  @ApiPropertyOptional({ description: 'Targeted therapy / Immunotherapy drug cost in INR', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetedMedCost?: number;

  @ApiPropertyOptional({ description: 'ICU and room stay cost in INR', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  icuBedCost?: number;

  @ApiPropertyOptional({ description: 'Diagnostic investigations & PET-CT cost in INR', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  investigationCost?: number;

  @ApiProperty({ description: 'Total estimated hospital cost in INR' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalEstimatedCost: number;

  @ApiPropertyOptional({ description: 'Amount patient family can arrange/self-fund in INR', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  patientContribution?: number;

  @ApiProperty({ description: 'Net financial deficit needed from trust/aid in INR' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  netDeficitRequired: number;

  @ApiProperty({ description: 'Clinical summary justifying the treatment urgency' })
  @IsNotEmpty()
  @IsString()
  clinicalJustification: string;

  @ApiPropertyOptional({ description: 'Hospital Bank Account Name for direct trust RTGS' })
  @IsOptional()
  @IsString()
  hospitalAccountName?: string;

  @ApiPropertyOptional({ description: 'Hospital Bank Name' })
  @IsOptional()
  @IsString()
  hospitalBankName?: string;

  @ApiPropertyOptional({ description: 'Hospital Bank Account Number' })
  @IsOptional()
  @IsString()
  hospitalAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Hospital Bank IFSC Code' })
  @IsOptional()
  @IsString()
  hospitalIfscCode?: string;
}
