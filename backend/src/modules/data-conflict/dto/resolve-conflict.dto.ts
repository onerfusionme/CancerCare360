import { IsString } from 'class-validator';

export class ResolveConflictDto {
  @IsString()
  resolution: string;
}
