import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @Transform(({ value, obj }) => {
    let val = value;
    if (!val && obj?.metadata) {
      try {
        const parsed = typeof obj.metadata === 'string' ? JSON.parse(obj.metadata) : obj.metadata;
        val = parsed.patientId;
      } catch {}
    }
    return (!val || val === '' || val === 'undefined' || val === 'null') ? undefined : val;
  })
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @Transform(({ value, obj }) => {
    let val = value;
    if (!val && obj?.metadata) {
      try {
        const parsed = typeof obj.metadata === 'string' ? JSON.parse(obj.metadata) : obj.metadata;
        val = parsed.journeyId;
      } catch {}
    }
    return (!val || val === '' || val === 'undefined' || val === 'null') ? undefined : val;
  })
  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @Transform(({ value, obj }) => {
    if (value) return value;
    if (obj?.type) return obj.type;
    if (obj?.metadata) {
      try {
        const parsed = typeof obj.metadata === 'string' ? JSON.parse(obj.metadata) : obj.metadata;
        return parsed.documentType || parsed.type;
      } catch {}
    }
    return value;
  })
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

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  metadata?: string;
}

