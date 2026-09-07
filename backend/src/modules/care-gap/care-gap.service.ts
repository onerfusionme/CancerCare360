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
         const overdueMilestones = await this.prisma.careMilestone.findMany({ 
            where: { tenantId, expectedDate: { lt: new Date() }, status: { not: 'COMPLETED' } } as any,
            include: { journey: { include: { patient: true } } } as any
         });
         gaps = overdueMilestones.map((m: any) => ({
            patientId: m.journey.patient.id,
            patientName: `${m.journey.patient.firstName} ${m.journey.patient.lastName}`,
            mrn: m.journey.patient.mrn,
            gapType: type,
            description: `Overdue milestone: ${m.milestoneType}`,
            priorityScore: weight,
            detectedAt: new Date(),
            ruleId: (rule as any).id,
            actionableInfo: { milestoneId: m.id },
         }));
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
         
         gaps = missedAppts.map((appt: any) => ({
            patientId: appt.patientId,
            patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
            mrn: appt.patient.mrn,
            gapType: type,
            description: 'Missed appointment detected',
            priorityScore: weight,
            detectedAt: new Date(),
            ruleId: (rule as any).id,
            actionableInfo: { appointmentId: appt.id },
         }));
      } else if (type === CareGapRuleType.MISSING_FOLLOW_UP) {
         const missingFollowUps = await this.prisma.followUpTask.findMany({ 
            where: { tenantId, dueDate: { lt: new Date() }, status: 'OPEN' } as any,
            include: { patient: true } as any
         });
         gaps = missingFollowUps.map((t: any) => ({
            patientId: t.patientId,
            patientName: `${t.patient.firstName} ${t.patient.lastName}`,
            mrn: t.patient.mrn,
            gapType: type,
            description: `Overdue follow-up task: ${t.taskType}`,
            priorityScore: weight,
            detectedAt: new Date(),
            ruleId: (rule as any).id,
            actionableInfo: { taskId: t.id },
         }));
      } else if (type === CareGapRuleType.PENDING_INVESTIGATION) {
         const threshold = new Date(Date.now() - (cond.thresholdDays || 7) * 86400000);
         const pendingInvestigations = await this.prisma.investigation.findMany({
            where: { tenantId, status: 'ORDERED', orderedAt: { lt: threshold } } as any,
            include: { patient: true } as any
         });
         gaps = pendingInvestigations.map((i: any) => ({
            patientId: i.patientId,
            patientName: `${i.patient.firstName} ${i.patient.lastName}`,
            mrn: i.patient.mrn,
            gapType: type,
            description: `Pending investigation: ${i.investigationType}`,
            priorityScore: weight,
            detectedAt: new Date(),
            ruleId: (rule as any).id,
            actionableInfo: { investigationId: i.id },
         }));
      } else if (type === CareGapRuleType.TREATMENT_DELAY) {
         const treatmentDelays = await this.prisma.treatmentMilestone.findMany({
            where: { tenantId, scheduledDate: { lt: new Date() }, status: { not: 'COMPLETED' } } as any,
            include: { patient: true } as any
         });
         gaps = treatmentDelays.map((t: any) => ({
            patientId: t.patientId,
            patientName: `${t.patient.firstName} ${t.patient.lastName}`,
            mrn: t.patient.mrn,
            gapType: type,
            description: `Treatment delay: ${t.treatmentType}`,
            priorityScore: weight,
            detectedAt: new Date(),
            ruleId: (rule as any).id,
            actionableInfo: { treatmentId: t.id },
         }));
      } else if (type === 'LOST_TO_CARE') {
         const ninetyDaysAgo = new Date();
         ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
         const lostPatients = await this.prisma.patient.findMany({
            where: {
               tenantId,
               status: 'ACTIVE',
               appointments: { none: { scheduledAt: { gt: ninetyDaysAgo } } },
               investigations: { none: { createdAt: { gt: ninetyDaysAgo } } },
               journeyEvents: { none: { eventDate: { gt: ninetyDaysAgo } } }
            } as any
         });
         gaps = lostPatients.map((p: any) => ({
            patientId: p.id,
            patientName: `${p.firstName} ${p.lastName}`,
            mrn: p.mrn,
            gapType: 'LOST_TO_CARE',
            ruleType: 'LOST_TO_CARE',
            description: 'Patient lost to care (no activity in last 90 days)',
            priorityScore: 90,
            priorityWeight: 90,
            detectedAt: new Date(),
            ruleId: (rule as any).id,
            actionableInfo: { patientId: p.id },
         }));
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
