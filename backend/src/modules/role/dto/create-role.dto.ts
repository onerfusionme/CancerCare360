import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Chemotherapy Nurse Navigator' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Manages infusion schedules, patient education, and toxicities.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: [String],
    description: 'Array of permission keys in format "RESOURCE:ACTION" (e.g. ["PATIENT:READ", "JOURNEY:UPDATE"]) or permission UUIDs',
  })
  @IsArray()
  @IsNotEmpty()
  permissions: string[];
}
