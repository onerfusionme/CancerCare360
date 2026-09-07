import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EducationCategory } from './create-education.dto';

export class EducationFilterDto {
  @ApiProperty({ required: false, enum: EducationCategory })
  @IsEnum(EducationCategory)
  @IsOptional()
  category?: EducationCategory;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}
