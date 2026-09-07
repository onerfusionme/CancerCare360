import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EducationCategory {
  GENERAL = 'GENERAL',
  SCREENING = 'SCREENING',
  TREATMENT = 'TREATMENT',
  NUTRITION = 'NUTRITION',
  POST_CARE = 'POST_CARE',
}

export class CreateEducationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: EducationCategory })
  @IsEnum(EducationCategory)
  @IsNotEmpty()
  category: EducationCategory;

  @ApiProperty({ default: 'en' })
  @IsString()
  @IsOptional()
  language?: string = 'en';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string = 'DRAFT';
}
