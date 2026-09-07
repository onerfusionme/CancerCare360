import { IsString, IsOptional, IsEnum, IsBoolean, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReferralSource } from '@prisma/client';

export class CreateReferralDto {
  @IsString()
  referredByName: string;

  @IsEnum(ReferralSource)
  referredByType: ReferralSource;

  @IsOptional()
  @IsString()
  referredByContact?: string;

  @IsString()
  referredToId: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsString()
  patientId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  referralDate?: Date;
}

export class ReferralFilterDto {
  @IsOptional()
  @IsEnum(ReferralSource)
  referredByType?: ReferralSource;

  @IsOptional()
  @IsString()
  referredToId?: string;

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
