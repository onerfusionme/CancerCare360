import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostCategory } from '@prisma/client';

export class CreateCaregiverPostDto {
  @ApiProperty({ enum: PostCategory, default: PostCategory.DIET_AND_DYSPHAGIA })
  @IsEnum(PostCategory)
  category: PostCategory;

  @ApiProperty({ example: 'Esophageal Cancer' })
  @IsString()
  @IsNotEmpty()
  cancerType: string;

  @ApiProperty({ example: 'High-calorie smooth khichdi and ragi drink for swallowing difficulties (Karad)' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'My mother found standard dal khichdi painful to swallow due to radiation throat inflammation. Here is the recipe that worked best without choking...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'Karad' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Satara' })
  @IsString()
  @IsOptional()
  district?: string;
}

export class CreateCaregiverCommentDto {
  @ApiProperty({ example: 'Thank you so much for sharing this! Did adding ghee cause any nausea for your mother?' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
