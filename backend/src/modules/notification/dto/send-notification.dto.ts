import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationChannel } from './create-template.dto';

export enum RecipientType {
  PATIENT = 'PATIENT',
  USER = 'USER',
}

export class SendNotificationDto {
  @ApiProperty()
  @IsUUID()
  recipientId: string;

  @ApiProperty({ enum: RecipientType })
  @IsEnum(RecipientType)
  recipientType: RecipientType | string;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel | string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;
}
