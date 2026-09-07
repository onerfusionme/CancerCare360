import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SummarizeConsultationDto {
  @ApiProperty({ description: 'ID of the patient' })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiPropertyOptional({ description: 'Optional ID of the journey to summarize' })
  @IsOptional()
  @IsString()
  journeyId?: string;
}
