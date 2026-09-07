import { IsOptional, IsUUID, IsEnum, IsISO8601 } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { DocumentType, VerificationStatus } from '@prisma/client';

export class DocumentFilterDto extends PaginationQueryDto {
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @IsUUID()
  @IsOptional()
  journeyId?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @IsEnum(VerificationStatus)
  @IsOptional()
  verificationStatus?: VerificationStatus;

  @IsISO8601()
  @IsOptional()
  dateFrom?: string;

  @IsISO8601()
  @IsOptional()
  dateTo?: string;
}
