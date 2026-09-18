import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MemberType, CareTreatmentPhase } from '@prisma/client';

export class SearchPeersDto {
  @ApiPropertyOptional({ example: 'Esophageal Cancer' })
  @IsString()
  @IsOptional()
  cancerType?: string;

  @ApiPropertyOptional({ example: 'Karad' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Satara' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ example: 17.2882 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  userLat?: number;

  @ApiPropertyOptional({ example: 74.1831 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  userLng?: number;

  @ApiPropertyOptional({ example: 50, description: 'Maximum distance in kilometers' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxDistanceKm?: number;

  @ApiPropertyOptional({ enum: CareTreatmentPhase })
  @IsEnum(CareTreatmentPhase)
  @IsOptional()
  treatmentPhase?: CareTreatmentPhase;

  @ApiPropertyOptional({ enum: MemberType })
  @IsEnum(MemberType)
  @IsOptional()
  memberType?: MemberType;

  @ApiPropertyOptional({ example: 'Son' })
  @IsString()
  @IsOptional()
  caregiverRelation?: string;
}
