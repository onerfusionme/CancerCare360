import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportType {
  PATIENT_CENSUS = 'PATIENT_CENSUS',
  CARE_GAPS = 'CARE_GAPS',
  INVESTIGATION_TAT = 'INVESTIGATION_TAT',
  TREATMENT_COMPLETION = 'TREATMENT_COMPLETION',
}

export enum ReportFormat {
  CSV = 'CSV',
  JSON = 'JSON',
}

export class GenerateReportDto {
  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ enum: ReportFormat })
  @IsEnum(ReportFormat)
  format: ReportFormat;
}
