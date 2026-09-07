import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsObject, Max, Min } from 'class-validator';

export enum CareGapRuleType {
  OVERDUE_MILESTONE = 'OVERDUE_MILESTONE',
  MISSED_APPOINTMENT = 'MISSED_APPOINTMENT',
  PENDING_INVESTIGATION = 'PENDING_INVESTIGATION',
  MISSING_FOLLOW_UP = 'MISSING_FOLLOW_UP',
  TREATMENT_DELAY = 'TREATMENT_DELAY',
}

export class CreateRuleDto {
  @ApiProperty({ enum: CareGapRuleType })
  @IsEnum(CareGapRuleType)
  ruleType: CareGapRuleType | string;

  @ApiProperty()
  @IsObject()
  conditions: Record<string, any>;

  @ApiProperty({ minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  priorityWeight: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
