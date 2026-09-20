import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePalliativeClinicDto {
  @ApiProperty({ example: 'Krishna Valley Pain & Palliative Care Center' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'STANDALONE_CLINIC', enum: ['HOSPITAL_DEPT', 'STANDALONE_CLINIC', 'HOME_CARE_NGO', 'HOSPICE'] })
  @IsString()
  @IsNotEmpty()
  facilityType: string;

  @ApiProperty({ example: 'Karad' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Satara' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '415110' })
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiProperty({ example: 'Near Krishna Medical College, Karad-Dhebewadi Road' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Dr. Suresh Patil' })
  @IsString()
  @IsNotEmpty()
  leadContactPerson: string;

  @ApiProperty({ example: '+91 98221 54321' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: '+91 2164 241000' })
  @IsString()
  @IsOptional()
  emergencyHelpline?: string;

  @ApiPropertyOptional({ example: 'karad.palliative@cancercare.org' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    type: [String],
    example: ['NURSE_HOME_VISIT', 'DOCTOR_TELE_CONSULT', 'RESPITE_BEDS', 'EMOTIONAL_SUPPORT'],
  })
  @IsArray()
  @IsNotEmpty()
  servicesOffered: string[];

  @ApiPropertyOptional({ example: 'Specialized in home nursing, lymphedema care, and total pain management.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
