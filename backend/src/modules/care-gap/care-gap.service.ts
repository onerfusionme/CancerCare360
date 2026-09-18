import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRuleDto, CareGapRuleType } from './dto/create-rule.dto';

export interface DetectedCareGap {
  patientId: string;
  patientName: string;
  mrn: string;
  cancerType?: string | null;
  cancerStage?: string | null;
  gapType: string;
  description: string;
  priorityScore: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  priorityReason: string;
  suggestedNextAction: string;
  detectedAt: Date;
  dueDate: Date;
  careCoordinatorId?: string | null;
  actionableInfo: Record<string, any>;
}

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

  private calculatePriority(params: {
    baseWeight: number;
    gapLabel: string;
    stage?: string | null;
    daysOverdue: number;
    failedContacts?: number;
  }): { score: number; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; reason: string } {
    let score = params.baseWeight;
    const reasons: string[] = [];

    // Clinical stage bonus
    const stageStr = (params.stage || '').toUpperCase();
    if (stageStr.includes('IV') || stageStr.includes('4') || stageStr.includes('METASTATIC')) {
      score += 20;
      reasons.push('High clinical risk (Stage IV / Metastatic)');
    } else if (stageStr.includes('III') || stageStr.includes('3')) {
      score += 15;
      reasons.push('Elevated clinical risk (Stage III)');
    } else if (stageStr.includes('II') || stageStr.includes('2')) {
      score += 10;
      reasons.push('Moderate clinical risk (Stage II)');
    } else if (stageStr.includes('I') || stageStr.includes('1')) {
      score += 5;
    }

    // Days overdue
    if (params.daysOverdue > 0) {
      const overdueBonus = Math.min(25, Math.floor(params.daysOverdue * 2));
      score += overdueBonus;
      reasons.push(`${params.daysOverdue} day(s) overdue`);
    }

    // Stalled outreach
    if (params.failedContacts && params.failedContacts > 0) {
      const contactBonus = Math.min(15, params.failedContacts * 5);
      score += contactBonus;
      reasons.push(`${params.failedContacts} unsuccessful contact attempt(s)`);
    }

    score = Math.min(100, Math.max(10, score));

    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'LOW';
    if (score >= 75) priority = 'URGENT';
    else if (score >= 50) priority = 'HIGH';
    else if (score >= 25) priority = 'MEDIUM';

    const reasonSummary = `${priority} (Score ${score}): ${params.gapLabel}${reasons.length > 0 ? ' — ' + reasons.join('; ') : ''}`;

    return { score, priority, reason: reasonSummary };
  }

  async detectGaps(tenantId: string): Promise<DetectedCareGap[]> {
    const now = new Date();
    const allGaps: DetectedCareGap[] = [];

    // 1. OVERDUE FOLLOW-UP MILESTONES
    const overdueMilestones = await this.prisma.careMilestone.findMany({
      where: {
        tenantId,
        expectedDate: { lt: now },
        status: { not: 'COMPLETED' },
      },
      include: {
        journey: {
          include: {
            patient: {
              include: {
                careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1, orderBy: { startedAt: 'desc' } },
                outreachLogs: { take: 5, orderBy: { createdAt: 'desc' } },
              },
            },
          },
        },
      },
    });

    for (const m of overdueMilestones) {
      const patient = m.journey?.patient;
      if (!patient) continue;
      const expectedTime = m.expectedDate ? new Date(m.expectedDate).getTime() : now.getTime();
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - expectedTime) / 86400000));
      const failedContacts = patient.outreachLogs.filter((o: any) => o.outcome !== 'REACHED' && o.outcome !== 'APPOINTMENT_SCHEDULED').length;
      const cancerType = patient.careJourneys?.[0]?.diagnosisCategory;
      const cancerStage = patient.careJourneys?.[0]?.careStage;

      const calc = this.calculatePriority({
        baseWeight: 35,
        gapLabel: `Overdue milestone: ${m.milestoneType}`,
        stage: cancerStage,
        daysOverdue,
        failedContacts,
      });

      const dueTomorrow = new Date(now);
      dueTomorrow.setDate(dueTomorrow.getDate() + 1);

      allGaps.push({
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        cancerType,
        cancerStage,
        gapType: 'OVERDUE_MILESTONE',
        description: `Milestone ${m.milestoneType} is overdue by ${daysOverdue} day(s).`,
        priorityScore: calc.score,
        priority: calc.priority,
        priorityReason: calc.reason,
        suggestedNextAction: 'Initiate coordinator outreach to assess patient status and book clinical milestone',
        detectedAt: now,
        dueDate: dueTomorrow,
        careCoordinatorId: patient.careCoordinatorId,
        actionableInfo: { milestoneId: m.id, expectedDate: m.expectedDate },
      });
    }

    // 2. MISSED APPOINTMENTS (NO_SHOW without future appointment)
    const missedAppts = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        status: 'NO_SHOW',
      },
      include: {
        patient: {
          include: {
            careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1, orderBy: { startedAt: 'desc' } },
            appointments: {
              where: { scheduledAt: { gt: now }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
            },
            outreachLogs: { take: 5, orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    for (const appt of missedAppts) {
      const patient = appt.patient;
      if (!patient) continue;
      if (patient.appointments && patient.appointments.length > 0) continue;

      const daysOverdue = Math.max(1, Math.floor((now.getTime() - new Date(appt.scheduledAt).getTime()) / 86400000));
      const failedContacts = patient.outreachLogs.filter((o: any) => o.outcome !== 'REACHED' && o.outcome !== 'APPOINTMENT_SCHEDULED').length;
      const cancerType = patient.careJourneys?.[0]?.diagnosisCategory;
      const cancerStage = patient.careJourneys?.[0]?.careStage;

      const calc = this.calculatePriority({
        baseWeight: 35,
        gapLabel: 'Missed appointment with no future booking',
        stage: cancerStage,
        daysOverdue,
        failedContacts,
      });

      const dueToday = new Date(now);

      allGaps.push({
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        cancerType,
        cancerStage,
        gapType: 'MISSED_APPOINTMENT',
        description: `Missed ${appt.appointmentType || 'clinical'} appointment on ${new Date(appt.scheduledAt).toLocaleDateString()} without rescheduling.`,
        priorityScore: calc.score,
        priority: calc.priority,
        priorityReason: calc.reason,
        suggestedNextAction: 'Screen for barriers (transportation, financial, toxicities) & recover appointment slot',
        detectedAt: now,
        dueDate: dueToday,
        careCoordinatorId: patient.careCoordinatorId,
        actionableInfo: { appointmentId: appt.id, originalDate: appt.scheduledAt },
      });
    }

    // 3. CANCELLED APPOINTMENTS WITHOUT REBOOKING
    const cancelledAppts = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        status: 'CANCELLED',
      },
      include: {
        patient: {
          include: {
            careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1, orderBy: { startedAt: 'desc' } },
            appointments: {
              where: { scheduledAt: { gt: now }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
            },
            outreachLogs: { take: 5, orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    for (const appt of cancelledAppts) {
      const patient = appt.patient;
      if (!patient) continue;
      if (patient.appointments && patient.appointments.length > 0) continue;

      const daysOverdue = Math.max(1, Math.floor((now.getTime() - new Date(appt.scheduledAt).getTime()) / 86400000));
      const failedContacts = patient.outreachLogs.filter((o: any) => o.outcome !== 'REACHED' && o.outcome !== 'APPOINTMENT_SCHEDULED').length;
      const cancerType = patient.careJourneys?.[0]?.diagnosisCategory;
      const cancerStage = patient.careJourneys?.[0]?.careStage;

      const calc = this.calculatePriority({
        baseWeight: 30,
        gapLabel: 'Cancelled appointment without replacement booking',
        stage: cancerStage,
        daysOverdue,
        failedContacts,
      });

      const dueTomorrow = new Date(now);
      dueTomorrow.setDate(dueTomorrow.getDate() + 1);

      allGaps.push({
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        cancerType,
        cancerStage,
        gapType: 'CANCELLED_NO_REBOOK',
        description: `Appointment on ${new Date(appt.scheduledAt).toLocaleDateString()} was cancelled without rebooking.`,
        priorityScore: calc.score,
        priority: calc.priority,
        priorityReason: calc.reason,
        suggestedNextAction: 'Contact patient/caregiver to reschedule required clinical appointment',
        detectedAt: now,
        dueDate: dueTomorrow,
        careCoordinatorId: patient.careCoordinatorId,
        actionableInfo: { appointmentId: appt.id },
      });
    }

    // 4. PENDING INVESTIGATIONS EXCEEDING SLA (> 5 days)
    const fiveDaysAgo = new Date(now.getTime() - 5 * 86400000);
    const pendingInvestigations = await this.prisma.investigation.findMany({
      where: {
        tenantId,
        status: 'ORDERED',
        orderedAt: { lt: fiveDaysAgo },
      },
      include: {
        patient: {
          include: {
            careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1, orderBy: { startedAt: 'desc' } },
            outreachLogs: { take: 5, orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    for (const inv of pendingInvestigations) {
      const patient = inv.patient;
      if (!patient) continue;
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - new Date(inv.orderedAt).getTime()) / 86400000) - 5);
      const cancerType = patient.careJourneys?.[0]?.diagnosisCategory;
      const cancerStage = patient.careJourneys?.[0]?.careStage;

      const calc = this.calculatePriority({
        baseWeight: 35,
        gapLabel: `Pending investigation past SLA: ${inv.investigationType}`,
        stage: cancerStage,
        daysOverdue,
      });

      const dueToday = new Date(now);

      allGaps.push({
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        cancerType,
        cancerStage,
        gapType: 'PENDING_INVESTIGATION',
        description: `Investigation ${inv.investigationType} ordered on ${new Date(inv.orderedAt).toLocaleDateString()} has exceeded 5-day turnaround SLA.`,
        priorityScore: calc.score,
        priority: calc.priority,
        priorityReason: calc.reason,
        suggestedNextAction: 'Follow up with diagnostic department/lab and verify sample collection',
        detectedAt: now,
        dueDate: dueToday,
        careCoordinatorId: patient.careCoordinatorId,
        actionableInfo: { investigationId: inv.id, orderedAt: inv.orderedAt },
      });
    }

    // 5. UNREVIEWED DIAGNOSTIC REPORTS (> 48 hours)
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 3600000);
    const unreviewedReports = await this.prisma.investigation.findMany({
      where: {
        tenantId,
        status: 'REPORT_AVAILABLE',
        reviewedAt: null,
      },
      include: {
        patient: {
          include: {
            careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1, orderBy: { startedAt: 'desc' } },
          },
        },
      },
    });

    for (const inv of unreviewedReports) {
      const patient = inv.patient;
      if (!patient) continue;
      const cancerType = patient.careJourneys?.[0]?.diagnosisCategory;
      const cancerStage = patient.careJourneys?.[0]?.careStage;

      const calc = this.calculatePriority({
        baseWeight: 35,
        gapLabel: `Unreviewed investigation report: ${inv.investigationType}`,
        stage: cancerStage,
        daysOverdue: 2,
      });

      const dueToday = new Date(now);

      allGaps.push({
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        cancerType,
        cancerStage,
        gapType: 'UNREVIEWED_REPORT',
        description: `Investigation ${inv.investigationType} report is ready but not yet reviewed by treating oncologist.`,
        priorityScore: calc.score,
        priority: calc.priority,
        priorityReason: calc.reason,
        suggestedNextAction: 'Alert attending oncologist for priority review and care plan continuation',
        detectedAt: now,
        dueDate: dueToday,
        careCoordinatorId: patient.careCoordinatorId,
        actionableInfo: { investigationId: inv.id },
      });
    }

    // 6. ACTIVE PATIENTS WITH NO FUTURE APPOINTMENT SCHEDULED
    const activePatientsNoFuture = await this.prisma.patient.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        appointments: {
          none: {
            scheduledAt: { gt: now },
            status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          },
        },
      },
      include: {
        careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1, orderBy: { startedAt: 'desc' } },
        appointments: { take: 1, orderBy: { scheduledAt: 'desc' } },
        outreachLogs: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    for (const patient of activePatientsNoFuture) {
      const lastAppt = patient.appointments[0];
      const daysSinceLast = lastAppt ? Math.max(1, Math.floor((now.getTime() - new Date(lastAppt.scheduledAt).getTime()) / 86400000)) : 14;
      const cancerType = patient.careJourneys?.[0]?.diagnosisCategory;
      const cancerStage = patient.careJourneys?.[0]?.careStage;

      const calc = this.calculatePriority({
        baseWeight: 25,
        gapLabel: 'Active cancer patient with no future appointment scheduled',
        stage: cancerStage,
        daysOverdue: Math.floor(daysSinceLast / 7),
      });

      const dueInTwoDays = new Date(now);
      dueInTwoDays.setDate(dueInTwoDays.getDate() + 2);

      allGaps.push({
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        cancerType,
        cancerStage,
        gapType: 'NO_FUTURE_APPOINTMENT',
        description: `Active patient has no future appointment on calendar. Last seen ${lastAppt ? new Date(lastAppt.scheduledAt).toLocaleDateString() : 'earlier'}.`,
        priorityScore: calc.score,
        priority: calc.priority,
        priorityReason: calc.reason,
        suggestedNextAction: 'Establish next clinical protocol touchpoint with care team and schedule slot',
        detectedAt: now,
        dueDate: dueInTwoDays,
        careCoordinatorId: patient.careCoordinatorId,
        actionableInfo: { lastAppointmentDate: lastAppt?.scheduledAt },
      });
    }

    // 7. REPEATED NO-SHOWS (>= 2 NO_SHOW appointments)
    const repeatNoShows = await this.prisma.patient.findMany({
      where: {
        tenantId,
        appointments: {
          some: { status: 'NO_SHOW' },
        },
      },
      include: {
        careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1, orderBy: { startedAt: 'desc' } },
        appointments: { where: { status: 'NO_SHOW' } },
        outreachLogs: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    for (const patient of repeatNoShows) {
      if (patient.appointments.length >= 2) {
        const failedContacts = patient.outreachLogs.filter((o: any) => o.outcome !== 'REACHED' && o.outcome !== 'APPOINTMENT_SCHEDULED').length;
        const cancerType = patient.careJourneys?.[0]?.diagnosisCategory;
        const cancerStage = patient.careJourneys?.[0]?.careStage;

        const calc = this.calculatePriority({
          baseWeight: 45,
          gapLabel: `Repeated no-shows (${patient.appointments.length} missed sessions)`,
          stage: cancerStage,
          daysOverdue: 7,
          failedContacts,
        });

        const dueToday = new Date(now);

        allGaps.push({
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          mrn: patient.mrn,
          cancerType,
          cancerStage,
          gapType: 'REPEATED_NO_SHOW',
          description: `High-risk patient has missed ${patient.appointments.length} consecutive appointments.`,
          priorityScore: calc.score,
          priority: calc.priority,
          priorityReason: calc.reason,
          suggestedNextAction: 'Conduct comprehensive root-cause barrier assessment (financial, travel, social) and escalate',
          detectedAt: now,
          dueDate: dueToday,
          careCoordinatorId: patient.careCoordinatorId,
          actionableInfo: { noShowCount: patient.appointments.length },
        });
      }
    }

    // 8. STALLED OUTREACH (>= 2 failed contact attempts on an active task)
    const tasksWithFailedOutreach = await this.prisma.followUpTask.findMany({
      where: {
        tenantId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        outreachLogs: {
          some: { outcome: { in: ['NO_ANSWER', 'PHONE_SWITCHED_OFF', 'WRONG_NUMBER', 'INVALID_NUMBER'] } },
        },
      },
      include: {
        patient: {
          include: {
            careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1, orderBy: { startedAt: 'desc' } },
          },
        },
        outreachLogs: { orderBy: { contactDate: 'desc' } },
      },
    });

    for (const task of tasksWithFailedOutreach) {
      const failed = task.outreachLogs.filter((o: any) => ['NO_ANSWER', 'PHONE_SWITCHED_OFF', 'WRONG_NUMBER', 'INVALID_NUMBER'].includes(o.outcome));
      if (failed.length >= 2 && task.patient) {
        const cancerType = task.patient.careJourneys?.[0]?.diagnosisCategory;
        const cancerStage = task.patient.careJourneys?.[0]?.careStage;

        const calc = this.calculatePriority({
          baseWeight: 40,
          gapLabel: `Stalled outreach (${failed.length} failed attempts)`,
          stage: cancerStage,
          daysOverdue: 5,
          failedContacts: failed.length,
        });

        const dueToday = new Date(now);

        allGaps.push({
          patientId: task.patient.id,
          patientName: `${task.patient.firstName} ${task.patient.lastName}`,
          mrn: task.patient.mrn,
          cancerType,
          cancerStage,
          gapType: 'STALLED_OUTREACH',
          description: `Coordinator has made ${failed.length} unsuccessful outreach attempts without reaching patient.`,
          priorityScore: calc.score,
          priority: calc.priority,
          priorityReason: calc.reason,
          suggestedNextAction: 'Switch communication channel (WhatsApp/SMS), contact secondary caregiver, or notify field navigator',
          detectedAt: now,
          dueDate: dueToday,
          careCoordinatorId: task.patient.careCoordinatorId,
          actionableInfo: { taskId: task.id, failedAttempts: failed.length },
        });
      }
    }

    // 9. EXTENDED INACTIVITY / LOST TO CARE (45+ days without documented event)
    const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 86400000);
    const inactivePatients = await this.prisma.patient.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        appointments: { none: { scheduledAt: { gt: fortyFiveDaysAgo } } },
        investigations: { none: { createdAt: { gt: fortyFiveDaysAgo } } },
        journeyEvents: { none: { eventDate: { gt: fortyFiveDaysAgo } } },
      },
      include: {
        careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1, orderBy: { startedAt: 'desc' } },
        outreachLogs: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    for (const patient of inactivePatients) {
      const cancerType = patient.careJourneys?.[0]?.diagnosisCategory;
      const cancerStage = patient.careJourneys?.[0]?.careStage;

      const calc = this.calculatePriority({
        baseWeight: 40,
        gapLabel: 'Patient lost to continuity (no activity in 45+ days)',
        stage: cancerStage,
        daysOverdue: 14,
      });

      const dueTomorrow = new Date(now);
      dueTomorrow.setDate(dueTomorrow.getDate() + 1);

      allGaps.push({
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        cancerType,
        cancerStage,
        gapType: 'LOST_TO_CARE',
        description: 'No clinical appointments, investigations, or touchpoints documented in the last 45 days.',
        priorityScore: calc.score,
        priority: calc.priority,
        priorityReason: calc.reason,
        suggestedNextAction: 'Initiate LTFU tracing protocol: family outreach, alternate contact, and community navigation check',
        detectedAt: now,
        dueDate: dueTomorrow,
        careCoordinatorId: patient.careCoordinatorId,
        actionableInfo: { inactiveDays: 45 },
      });
    }

    // Deduplicate by patientId + gapType and sort by priorityScore desc
    const uniqueGaps = new Map<string, DetectedCareGap>();
    for (const gap of allGaps) {
      const key = `${gap.patientId}_${gap.gapType}`;
      if (!uniqueGaps.has(key) || (uniqueGaps.get(key)!.priorityScore < gap.priorityScore)) {
        uniqueGaps.set(key, gap);
      }
    }

    const sorted = Array.from(uniqueGaps.values()).sort((a, b) => b.priorityScore - a.priorityScore);
    return sorted;
  }

  async autoGenerateTasks(tenantId: string, gaps: DetectedCareGap[]) {
    const createdTasks: any[] = [];

    for (const gap of gaps) {
      const existing = await this.prisma.followUpTask.findFirst({
        where: {
          tenantId,
          patientId: gap.patientId,
          careGapType: gap.gapType,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      });

      if (!existing) {
        const task = await this.prisma.followUpTask.create({
          data: {
            tenantId,
            patientId: gap.patientId,
            taskType: 'CARE_GAP_FOLLOW_UP',
            careGapType: gap.gapType,
            priority: gap.priority,
            priorityScore: gap.priorityScore,
            priorityReason: gap.priorityReason,
            issueDescription: gap.description,
            nextAction: gap.suggestedNextAction,
            lastAction: 'System automatically detected care gap',
            dueDate: gap.dueDate,
            assignedToId: gap.careCoordinatorId || null,
            status: 'OPEN',
          },
        });
        createdTasks.push(task);
      } else {
        if (gap.priorityScore > (existing.priorityScore || 0)) {
          await this.prisma.followUpTask.update({
            where: { id: existing.id },
            data: {
              priorityScore: gap.priorityScore,
              priorityReason: gap.priorityReason,
              priority: gap.priority,
              nextAction: gap.suggestedNextAction,
            },
          });
        }
      }
    }

    return createdTasks;
  }
}
