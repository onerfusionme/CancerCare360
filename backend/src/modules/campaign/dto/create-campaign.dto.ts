import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CampaignType {
  SCREENING = 'SCREENING',
  AWARENESS = 'AWARENESS',
  VACCINATION = 'VACCINATION',
  FOLLOW_UP_REMINDER = 'FOLLOW_UP_REMINDER',
}

export enum CampaignChannel {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  PORTAL = 'PORTAL',
}

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CampaignType })
  @IsEnum(CampaignType)
  @IsNotEmpty()
  type: CampaignType;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  audienceCriteria: Record<string, any>;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ enum: CampaignChannel })
  @IsEnum(CampaignChannel)
  @IsNotEmpty()
  channel: CampaignChannel;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;
}
