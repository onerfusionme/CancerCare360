import { IsEnum, IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AidApplicationStatus } from '@prisma/client';

export class UpdateAidApplicationStatusDto {
  @ApiProperty({ enum: AidApplicationStatus, description: 'Updated workflow status' })
  @IsEnum(AidApplicationStatus)
  status: AidApplicationStatus;

  @ApiPropertyOptional({ description: 'Sanctioned grant amount in INR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sanctionedAmount?: number;

  @ApiPropertyOptional({ description: 'Government / Trust official application acknowledgement number' })
  @IsOptional()
  @IsString()
  applicationRefNumber?: string;

  @ApiPropertyOptional({ description: 'Official Sanction Order / Cheque number' })
  @IsOptional()
  @IsString()
  sanctionLetterNumber?: string;

  @ApiPropertyOptional({ description: 'Status remarks or explanation' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
