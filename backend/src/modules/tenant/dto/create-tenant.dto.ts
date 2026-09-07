import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, Matches } from 'class-validator';
import { TenantType, TenantStatus } from '@prisma/client';

export class CreateTenantDto {
  @ApiProperty({ example: 'City Hospital' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'city-hospital' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  slug: string;

  @ApiProperty({ enum: TenantType })
  @IsEnum(TenantType)
  @IsNotEmpty()
  type: TenantType;

  @ApiProperty({ enum: TenantStatus, default: TenantStatus.ACTIVE })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus = TenantStatus.ACTIVE;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
