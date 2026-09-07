import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class ExtractDocumentDto {
  @ApiProperty({ description: 'ID of the document to extract data from' })
  @IsNotEmpty()
  @IsString()
  documentId: string;

  @ApiPropertyOptional({ description: 'Type of the document' })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiPropertyOptional({ description: 'Additional options for extraction' })
  @IsOptional()
  @IsObject()
  options?: any;
}
