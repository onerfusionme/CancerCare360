import { IsUUID, IsString, IsOptional, IsISO8601 } from 'class-validator';

export class CreateMilestoneDto {
  @IsUUID()
  journeyId: string;

  @IsString()
  milestoneType: string;

  @IsISO8601()
  @IsOptional()
  expectedDate?: string;

  @IsUUID()
  @IsOptional()
  responsibleUserId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
