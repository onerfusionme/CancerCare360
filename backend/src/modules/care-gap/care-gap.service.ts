import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRuleDto, CareGapRuleType } from './dto/create-rule.dto';

@Injectable()
export class CareGapService {
  constructor(private prisma: PrismaService) {}

  async createRule(tenantId: string, dto: CreateRuleDto) {
    return this.prisma.careGapRule.create({
      data: {
        ...dto,
        tenantId,
      } as any,
    });
  }

  async getRules(tenantId: string) {
    return this.prisma.careGapRule.findMany({
      where: { tenantId, isActive: true } as any,
    });
  }

  async updateRule(tenantId: string, id: string, dto: Partial<CreateRuleDto>) {
    return this.prisma.careGapRule.update({
      where: { id, tenantId } as any,
      data: dto,
    });
  }

  async toggleRule(tenantId: string, id: string) {
    const rule = await this.prisma.careGapRule.findUnique({ where: { id, tenantId } as any });
    if (!rule) throw new Error('Rule not found');
    return this.prisma.careGapRule.update({
      where: { id },
      data: { isActive: !(rule as any).isActive },
    });
  }

  async detectGaps(tenantId: string) {
    const rules = await this.getRules(tenantId);
    let allGaps: any[] = [];

    for (const rule of rules) {
      const type = (rule as any).ruleType;
      const cond = (rule as any).conditions as any;
      const weight = (rule as any).priorityWeight;
      let gaps: any[] = [];

      if (type === CareGapRuleType.OVERDUE_MILESTONE) {
         // Placeholder for OVERDUE_MILESTONE logic
         gaps = []; 
      } else if (type === CareGapRuleType.MISSED_APPOINTMENT) {
         const lookbackDate = new Date();
         lookbackDate.setDate(lookbackDate.getDate() - (cond.lookbackDays || 7));
         
         const missedAppts = await this.prisma.appointment.findMany({
            where: {
               tenantId,
               status: 'NO_SHOW',
               scheduledAt: { gte: lookbackDate }
            } as any,
            include: { patient: true } as any,
         });
         
         gaps = missedAppts.map(appt => ({
            patientId: (appt as any).patientId,
            patientName: (appt as any).patient.name,
            mrn: (appt as any).patient.mrn,
            gapType: type,
            description: 'Missed appointment detected',
            priorityScore: weight,
            detectedAt: new Date(),
            ruleId: (rule as any).id,
            actionableInfo: { appointmentId: (appt as any).id },
         }));
      } else if (type === CareGapRuleType.MISSING_FOLLOW_UP) {
         // Placeholder
      } else if (type === CareGapRuleType.PENDING_INVESTIGATION) {
         // Placeholder
      } else if (type === CareGapRuleType.TREATMENT_DELAY) {
         // Placeholder
      }

      allGaps = allGaps.concat(gaps);
    }

    allGaps.sort((a, b) => b.priorityScore - a.priorityScore);
    return allGaps;
  }

  async autoGenerateTasks(tenantId: string, gaps: any[]) {
     const createdTasks: any[] = [];
     for (const gap of gaps) {
        const existing = await this.prisma.followUpTask.findFirst({
           where: {
              tenantId,
              patientId: gap.patientId,
              taskType: 'CARE_GAP_FOLLOW_UP',
              status: { in: ['OPEN', 'IN_PROGRESS'] }
           } as any,
        });

        if (!existing) {
           const dueDate = new Date();
           dueDate.setDate(dueDate.getDate() + 1); // due tomorrow
           const task = await this.prisma.followUpTask.create({
              data: {
                 tenantId,
                 patientId: gap.patientId,
                 taskType: 'CARE_GAP_FOLLOW_UP',
                 priority: 'HIGH',
                 issueDescription: gap.description,
                 dueDate,
                 status: 'OPEN',
              } as any,
           });
           createdTasks.push(task);
        }
     }
     return createdTasks;
  }
}
