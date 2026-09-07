import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  diagnosisCategory: string;

  @IsString()
  milestoneType: string;

  @IsInt()
  sequence: number;

  @IsInt()
  defaultIntervalDays: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
