import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ConcordanceLevel } from '@prisma/client';

export class UpdateConsensusDto {
  @ApiProperty({ description: 'Concordance level compared to outside opinion', enum: ConcordanceLevel })
  @IsEnum(ConcordanceLevel)
  @IsNotEmpty()
  concordanceLevel: ConcordanceLevel;

  @ApiPropertyOptional({ description: 'Discordance summary explaining diagnostic or therapeutic shifts' })
  @IsString()
  @IsOptional()
  discordanceSummary?: string;

  @ApiProperty({ description: 'Official CancerCare360 Expert Consensus Opinion' })
  @IsString()
  @IsNotEmpty()
  consensusOpinion: string;

  @ApiProperty({ description: 'Recommended Treatment Regimen / Protocol' })
  @IsString()
  @IsNotEmpty()
  recommendedRegimen: string;

  @ApiPropertyOptional({ description: 'NCCN / ESMO Guideline Citation Supporting Consensus' })
  @IsString()
  @IsOptional()
  nccnGuidelineCitation?: string;

  @ApiPropertyOptional({ description: 'Eligible active clinical trials' })
  @IsString()
  @IsOptional()
  clinicalTrialOption?: string;

  @ApiPropertyOptional({ description: 'Mark whether reviewed in Multidisciplinary Tumor Board (MDT)' })
  @IsBoolean()
  @IsOptional()
  isTumorBoardCase?: boolean;

  @ApiPropertyOptional({ description: 'Tumor Board Review Date' })
  @IsOptional()
  tumorBoardDate?: Date;

  @ApiPropertyOptional({ description: 'Tele-consultation video meeting date' })
  @IsOptional()
  teleConsultDate?: Date;

  @ApiPropertyOptional({ description: 'Tele-consultation video room URL' })
  @IsString()
  @IsOptional()
  teleConsultMeetingUrl?: string;
}
