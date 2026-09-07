import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  provenance?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
