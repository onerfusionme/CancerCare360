import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignDoctorDto {
  @ApiProperty({ description: 'ID of oncologist assigned to review the case' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;
}
