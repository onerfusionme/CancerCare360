import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class ExplainGapDto {
  @ApiProperty({ description: 'Type of the care gap' })
  @IsNotEmpty()
  @IsString()
  gapType: string;

  @ApiProperty({ description: 'Data related to the care gap' })
  @IsNotEmpty()
  @IsObject()
  gapData: any;
}
