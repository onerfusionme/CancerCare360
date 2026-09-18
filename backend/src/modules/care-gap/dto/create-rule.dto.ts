import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsObject, Max, Min } from 'class-validator';

export enum CareGapRuleType {
  OVERDUE_MILESTONE = 'OVERDUE_MILESTONE',
  MISSED_APPOINTMENT = 'MISSED_APPOINTMENT',
  CANCELLED_NO_REBOOK = 'CANCELLED_NO_REBOOK',
  PENDING_INVESTIGATION = 'PENDING_INVESTIGATION',
  UNREVIEWED_REPORT = 'UNREVIEWED_REPORT',
  NO_FUTURE_APPOINTMENT = 'NO_FUTURE_APPOINTMENT',
  REPEATED_NO_SHOW = 'REPEATED_NO_SHOW',
  STALLED_OUTREACH = 'STALLED_OUTREACH',
  LOST_TO_CARE = 'LOST_TO_CARE',
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
