import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDonorPledgeDto {
  @ApiProperty({ description: 'ID of the onboarded donor/philanthropist' })
  @IsNotEmpty()
  @IsString()
  donorId: string;

  @ApiPropertyOptional({ description: 'Patient ID receiving the sponsorship' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ description: 'Treatment cost estimate ID' })
  @IsOptional()
  @IsString()
  estimateId?: string;

  @ApiProperty({ description: 'Amount pledged in INR' })
  @IsNotEmpty()
  @IsNumber()
  @Min(500)
  pledgedAmount: number;

  @ApiPropertyOptional({ description: 'Cheque/NEFT/RTGS transaction reference' })
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional({ description: 'Personal message or encouragement for the patient' })
  @IsOptional()
  @IsString()
  note?: string;
}
