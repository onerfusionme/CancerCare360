import { IsString, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CommunicationPreferences {
  @ApiProperty()
  @IsBoolean()
  sms: boolean;

  @ApiProperty()
  @IsBoolean()
  email: boolean;

  @ApiProperty()
  @IsBoolean()
  whatsapp: boolean;
}

export class UpdatePreferencesDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @ApiProperty({ type: CommunicationPreferences, required: false })
  @ValidateNested()
  @Type(() => CommunicationPreferences)
  @IsOptional()
  communicationPreferences?: CommunicationPreferences;
}
