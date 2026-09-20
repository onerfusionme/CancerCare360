import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePalliativeAssessmentDto {
  @ApiProperty({ example: 'b947c9f8-7b98-4c3e-874e-67015a999710' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: 'Rahul Deshmukh' })
  @IsString()
  @IsOptional()
  patientName?: string;

  // 4 Dimensions of Total Pain (0 - 10)
  @ApiProperty({ example: 6, minimum: 0, maximum: 10, description: 'Physical pain intensity' })
  @IsNumber()
  @Min(0)
  @Max(10)
  physicalPain: number;

  @ApiProperty({ example: 5, minimum: 0, maximum: 10, description: 'Emotional & psychological distress' })
  @IsNumber()
  @Min(0)
  @Max(10)
  psychologicalDistress: number;

  @ApiProperty({ example: 7, minimum: 0, maximum: 10, description: 'Social & financial toxicity / family strain' })
  @IsNumber()
  @Min(0)
  @Max(10)
  socialFinancialToxicity: number;

  @ApiProperty({ example: 4, minimum: 0, maximum: 10, description: 'Spiritual & existential distress' })
  @IsNumber()
  @Min(0)
  @Max(10)
  spiritualDistress: number;

  // Core ESAS physical symptoms (0 - 10)
  @ApiPropertyOptional({ example: 6, minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  fatigue?: number;

  @ApiPropertyOptional({ example: 3, minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  shortnessOfBreath?: number;

  @ApiPropertyOptional({ example: 2, minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  nausea?: number;

  @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  appetiteLoss?: number;

  @ApiPropertyOptional({ example: 4, minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  overallWellBeing?: number;

  @ApiPropertyOptional({ example: 'Patient reports sharp lumbar discomfort and high financial anxiety regarding next treatment rest interval.' })
  @IsString()
  @IsOptional()
  notes?: string;
}
