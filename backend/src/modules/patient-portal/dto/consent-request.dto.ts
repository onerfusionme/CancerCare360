import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsentRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  durationDays: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  scope: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  abhaId?: string;
}
