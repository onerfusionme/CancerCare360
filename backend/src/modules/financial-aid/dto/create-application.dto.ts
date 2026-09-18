import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAidApplicationDto {
  @ApiPropertyOptional({ description: 'Associated patient ID' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiProperty({ description: 'ID of the selected government scheme or temple trust' })
  @IsNotEmpty()
  @IsString()
  schemeId: string;

  @ApiPropertyOptional({ description: 'ID of the generated TreatmentCostEstimate' })
  @IsOptional()
  @IsString()
  estimateId?: string;

  @ApiProperty({ description: 'Applicant or relative full name' })
  @IsNotEmpty()
  @IsString()
  applicantName: string;

  @ApiProperty({ description: 'Relationship to patient (e.g. Son, Daughter, Self, Spouse)' })
  @IsNotEmpty()
  @IsString()
  applicantRelation: string;

  @ApiProperty({ description: 'Contact phone number' })
  @IsNotEmpty()
  @IsString()
  applicantContact: string;

  @ApiProperty({ description: 'Financial grant amount applied for in INR' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  appliedAmount: number;

  @ApiPropertyOptional({ description: 'List of attached document types', type: [String] })
  @IsOptional()
  @IsArray()
  documentsAttached?: string[];

  @ApiPropertyOptional({ description: 'Additional applicant notes' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
