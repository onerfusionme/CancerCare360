import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DraftEducationDto {
  @ApiProperty({ description: 'Topic for the patient communication' })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiProperty({ description: 'Language of the communication' })
  @IsNotEmpty()
  @IsString()
  language: string;

  @ApiProperty({ description: 'Key points to include in the draft', type: [String] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  keyPoints: string[];
}
