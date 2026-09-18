import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConnectionStatus } from '@prisma/client';

export class CreateConnectionRequestDto {
  @ApiProperty({ description: 'Target CareCircleProfile ID to connect with' })
  @IsString()
  @IsNotEmpty()
  recipientProfileId: string;

  @ApiPropertyOptional({ example: 'Hi, my mom was diagnosed with esophageal cancer as well. Would love to exchange diet tips and learn from your journey.' })
  @IsString()
  @IsOptional()
  connectionNote?: string;
}

export class RespondConnectionDto {
  @ApiProperty({ enum: ConnectionStatus, example: ConnectionStatus.ACCEPTED })
  @IsEnum(ConnectionStatus)
  status: ConnectionStatus;
}
