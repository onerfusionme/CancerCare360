import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeedbackDto {
  @IsString()
  patientId: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  npsScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  waitTimeRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  careQualityRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  communicationRating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class FeedbackFilterDto {
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateTo?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
