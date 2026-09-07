import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignType, CampaignChannel } from './create-campaign.dto';

export class CampaignFilterDto {
  @ApiProperty({ required: false, enum: CampaignType })
  @IsEnum(CampaignType)
  @IsOptional()
  type?: CampaignType;

  @ApiProperty({ required: false, enum: CampaignChannel })
  @IsEnum(CampaignChannel)
  @IsOptional()
  channel?: CampaignChannel;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  approvalStatus?: string;
}
