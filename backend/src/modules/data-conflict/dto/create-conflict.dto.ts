import { IsUUID, IsString } from 'class-validator';

export class CreateConflictDto {
  @IsUUID()
  patientId: string;

  @IsString()
  fieldName: string;

  @IsString()
  sourceA: string;

  @IsString()
  valueA: string;

  @IsString()
  sourceB: string;

  @IsString()
  valueB: string;
}
