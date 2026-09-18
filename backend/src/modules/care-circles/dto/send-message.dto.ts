import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPeerMessageDto {
  @ApiProperty({ example: 'Hello! How is your mother handling the current cycle? What liquid food has she found easiest to swallow?' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
