import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ReviewStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  MODIFIED = 'MODIFIED',
}

export class ReviewInteractionDto {
  @ApiProperty({ enum: ReviewStatus, description: 'The review status' })
  @IsNotEmpty()
  @IsEnum(ReviewStatus)
  reviewStatus: 'ACCEPTED' | 'REJECTED' | 'MODIFIED';

  @ApiPropertyOptional({ description: 'Notes provided by the reviewer' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
