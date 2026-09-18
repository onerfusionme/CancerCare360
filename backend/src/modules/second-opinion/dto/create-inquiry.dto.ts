import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class DocumentUploadItemDto {
  @ApiProperty({ description: 'Type of diagnostic document', example: 'BIOPSY_IHC' })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({ description: 'File display name', example: 'Biopsy_Histopathology_Report.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ description: 'File URL / storage link' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'AI extracted biomarker data' })
  @IsOptional()
  aiExtractedData?: any;
}

export class CreateInquiryDto {
  @ApiProperty({ description: 'Full patient name', example: 'Ramesh Kumar' })
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty({ description: 'Phone number for SMS/WhatsApp updates', example: '+91 98201 45892' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'ramesh.kumar@gmail.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Patient age', example: 54 })
  @IsNumber()
  @IsOptional()
  age?: number;

  @ApiPropertyOptional({ description: 'Gender', example: 'MALE' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Current city / hometown', example: 'Nagpur' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Primary cancer site / type', example: 'Lung Adenocarcinoma' })
  @IsString()
  @IsNotEmpty()
  cancerType: string;

  @ApiPropertyOptional({ description: 'First hospital/clinic consulted', example: 'Apollo Clinic Nagpur' })
  @IsString()
  @IsOptional()
  primaryHospital?: string;

  @ApiPropertyOptional({ description: 'Name of treating doctor who gave first opinion', example: 'Dr. S. Sharma' })
  @IsString()
  @IsOptional()
  primaryDoctorName?: string;

  @ApiPropertyOptional({ description: 'Primary diagnosis given by first doctor', example: 'Stage IIIA Non-Small Cell Lung Cancer (cT2a N2 M0)' })
  @IsString()
  @IsOptional()
  primaryDiagnosis?: string;

  @ApiPropertyOptional({ description: 'Treatment recommended by first doctor', example: 'Immediate Right Pneumonectomy (Full Lung Removal) + Adjuvant Chemo' })
  @IsString()
  @IsOptional()
  primaryTreatmentPlan?: string;

  @ApiPropertyOptional({ description: 'Reason for seeking second opinion', example: 'Exploring whether targeted immunotherapy or neoadjuvant chemo can preserve the lung' })
  @IsString()
  @IsOptional()
  inquiryReason?: string;

  @ApiPropertyOptional({ description: 'Clinical urgency level: ROUTINE, PRIORITY, STAT', default: 'ROUTINE' })
  @IsString()
  @IsOptional()
  clinicalUrgency?: string;

  @ApiPropertyOptional({ description: 'Array of uploaded diagnostic documents', type: [DocumentUploadItemDto] })
  @IsArray()
  @IsOptional()
  documents?: DocumentUploadItemDto[];
}
