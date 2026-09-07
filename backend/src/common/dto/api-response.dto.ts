import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data?: T;

  @ApiProperty({ example: 'Request completed successfully' })
  message?: string;

  @ApiProperty()
  errors?: any;
}
