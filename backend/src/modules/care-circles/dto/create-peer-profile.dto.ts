import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberType, PeerPrivacyMode, CareTreatmentPhase } from '@prisma/client';

export class CreatePeerProfileDto {
  @ApiPropertyOptional({ enum: MemberType, default: MemberType.FAMILY_CAREGIVER })
  @IsEnum(MemberType)
  @IsOptional()
  memberType?: MemberType;

  @ApiPropertyOptional({ example: 'Son' })
  @IsString()
  @IsOptional()
  caregiverRelation?: string;

  @ApiProperty({ example: 'Son of Esophageal Patient - Karad' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiPropertyOptional({ enum: PeerPrivacyMode, default: PeerPrivacyMode.ANONYMOUS_ALIAS })
  @IsEnum(PeerPrivacyMode)
  @IsOptional()
  privacyMode?: PeerPrivacyMode;

  @ApiProperty({ example: 'Esophageal Cancer' })
  @IsString()
  @IsNotEmpty()
  cancerType: string;

  @ApiPropertyOptional({ example: 'Mid-Thoracic Esophagus' })
  @IsString()
  @IsOptional()
  cancerSubsite?: string;

  @ApiPropertyOptional({ example: 'Stage III (Locally Advanced)' })
  @IsString()
  @IsOptional()
  cancerStage?: string;

  @ApiPropertyOptional({ enum: CareTreatmentPhase, default: CareTreatmentPhase.ACTIVE_CHEMO_RT })
  @IsEnum(CareTreatmentPhase)
  @IsOptional()
  treatmentPhase?: CareTreatmentPhase;

  @ApiProperty({ example: 'Karad' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Satara' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiPropertyOptional({ example: 'Maharashtra', default: 'Maharashtra' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '415110' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ example: 17.2882 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 74.1831 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: 'Caring for my mom, 58, diagnosed with mid-esophageal cancer. Eager to share recipes for pureed food, swallowing comfort, and emotional support.' })
  @IsString()
  @IsNotEmpty()
  bio: string;

  @ApiPropertyOptional({ example: 'What helped with dysphagia: Warm ragi soup, blended moong dal with a spoon of cow ghee, cooled tender coconut water. Avoid citrus and black pepper.' })
  @IsString()
  @IsOptional()
  dietaryAdvice?: string;

  @ApiPropertyOptional({ example: 'Elevate head by 30 degrees while resting; small sips every 15 minutes; mouth rinse with baking soda after meals to manage throat soreness.' })
  @IsString()
  @IsOptional()
  treatmentExperience?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isOptedIn?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isOpenToChat?: boolean;
}
