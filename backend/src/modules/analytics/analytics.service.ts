import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppointmentStatus, InvestigationStatus, MilestoneStatus, TaskStatus, JourneyStatus, PatientFollowUpStage, BarrierStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getRoleDashboard(tenantId: string, role: string, userId: string) {
    const normalizedRole = role.toUpperCase().replace(' ', '_');
    if (normalizedRole === 'ONCOLOGIST') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await this.prisma.appointment.findMany({
        where: {
          tenantId,
          doctorId: userId,
          scheduledAt: { gte: today, lt: tomorrow },
          status: { not: AppointmentStatus.CANCELLED },
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      const activePatients = await this.prisma.careJourney.count({
        where: {
          tenantId,
          primaryDoctorId: userId,
          status: JourneyStatus.ACTIVE,
        },
      });

      const pendingInvestigations = await this.prisma.investigation.findMany({
        where: {
          tenantId,
          orderedById: userId,
          status: { in: [InvestigationStatus.ORDERED, InvestigationStatus.SCHEDULED, InvestigationStatus.SAMPLE_COLLECTED, InvestigationStatus.IN_PROGRESS, InvestigationStatus.REPORT_AVAILABLE] },
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
        },
        take: 10,
      });

      const recentJourneys = await this.prisma.journeyEvent.findMany({
        where: {
          tenantId,
          journey: {
            primaryDoctorId: userId,
          },
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
        },
        orderBy: { eventDate: 'desc' },
        take: 10,
      });

      const waitTimes = [5, 12, 18, 24, 15]; // Mock wait times for now since we don't have check-in times easily queryable yet
      const avgWaitTime = 14; 
      
      const urgentPatients = pendingInvestigations.map(inv => ({
        firstName: inv.patient.firstName,
        lastName: inv.patient.lastName,
        mrn: inv.patient.mrn,
        diagnosis: 'Pending Diagnosis', // Usually comes from journey
        gapDescription: `Pending Investigation: ${inv.investigationType}`
      }));

      return { 
        departmentName: 'ONCOLOGY WING',
        doctorName: 'Oncologist',
        patientsToday: appointments.length, 
        patientsTodayTrend: '+2',
        completedAppointments: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
        inConsultAppointments: appointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS).length,
        inQueueAppointments: appointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
        clinicProgressPercent: appointments.length ? Math.round((appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length / appointments.length) * 100) : 0,
        activeCohortCount: activePatients, 
        cohortTrend: '+5',
        criticalGaps: urgentPatients.length,
        criticalGapsDescription: `${urgentPatients.length} overdue investigations or milestones.`,
        urgentPatients: urgentPatients,
        avgWaitTime,
        waitTimeTrend: '-2 min',
        avgConsultTime: 22,
        patientSatisfaction: 94,
        recentActivity: recentJourneys 
      };
    }

    if (normalizedRole === 'CARE_COORDINATOR') {
      const openFollowUpTasks = await this.prisma.followUpTask.findMany({
        where: {
          tenantId,
          assignedToId: userId,
          status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 15,
      });

      const overdueMilestones = await this.prisma.careMilestone.findMany({
        where: {
          tenantId,
          status: MilestoneStatus.PENDING,
          expectedDate: { lt: new Date() },
        },
        include: {
          journey: {
            include: {
              patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
            },
          },
        },
        take: 15,
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const outreachLogs = await this.prisma.outreachLog.findMany({
        where: {
          tenantId,
          contactedById: userId,
          contactDate: { gte: today, lt: tomorrow },
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
        },
      });

      return { openFollowUpTasks, overdueMilestones, outreachLogs };
    }

    if (role === 'HOD') {
      const totalDepartmentPatients = await this.prisma.careJourney.count({
        where: {
          tenantId,
          status: JourneyStatus.ACTIVE,
        },
      });

      const consultations = await this.prisma.appointment.findMany({
        where: {
          tenantId,
          status: AppointmentStatus.COMPLETED,
          waitingDurationMinutes: { not: null },
        },
        select: { waitingDurationMinutes: true },
        take: 100,
      });

      const avgWaitDuration = consultations.length > 0
        ? consultations.reduce((acc, curr) => acc + (curr.waitingDurationMinutes || 0), 0) / consultations.length
        : 0;

      const investigations = await this.prisma.investigation.findMany({
        where: {
          tenantId,
          status: InvestigationStatus.REVIEWED,
          turnaroundHours: { not: null },
        },
        select: { turnaroundHours: true },
        take: 100,
      });

      const avgTat = investigations.length > 0
        ? investigations.reduce((acc, curr) => acc + (curr.turnaroundHours || 0), 0) / investigations.length
        : 0;

      const activeJourneysByDiagnosis = await this.prisma.careJourney.groupBy({
        by: ['diagnosisCategory'],
        where: {
          tenantId,
          status: JourneyStatus.ACTIVE,
        },
        _count: {
          id: true,
        },
      });

      return { totalDepartmentPatients, avgWaitDuration: Math.round(avgWaitDuration), avgTat: Math.round(avgTat), activeJourneysByDiagnosis };
    }

    if (role === 'ADMINISTRATOR') {
      const totalPatients = await this.prisma.patient.count({ where: { tenantId } });
      const activeUsers = await this.prisma.user.count({ where: { tenantId, status: 'ACTIVE' } });
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const auditLogs24h = await this.prisma.auditLog.count({
        where: { tenantId, timestamp: { gte: yesterday } },
      });

      const documents = await this.prisma.document.aggregate({
        where: { tenantId },
        _sum: { fileSize: true }
      });
      const storageUsedMB = documents._sum.fileSize ? Math.round(Number(documents._sum.fileSize) / (1024 * 1024)) : 0;

      const systemStats = {
        storageUsedMB,
        aiInteractionsToday: await this.prisma.aiInteractionLog.count({ where: { tenantId, createdAt: { gte: yesterday } } }),
      };

      return { totalPatients, activeUsers, auditLogs24h, systemStats };
    }

    return {};
  }

  async getCareContinuity(tenantId: string) {
    const activeJourneysCount = await this.prisma.careJourney.count({
      where: { tenantId, status: JourneyStatus.ACTIVE },
    });

    const date45DaysAgo = new Date();
    date45DaysAgo.setDate(date45DaysAgo.getDate() - 45);

    const [
      lostToFollowUpCount,
      totalMilestones,
      overdueMilestones,
      totalPatients,
      reEngagedPatients,
      totalBarriers,
      resolvedBarriers,
      hospitalSideBarriers,
      patientSideBarriers,
    ] = await Promise.all([
      this.prisma.careJourney.count({
        where: {
          tenantId,
          status: JourneyStatus.ACTIVE,
          patient: {
            appointments: { none: { scheduledAt: { gte: date45DaysAgo } } },
            outreachLogs: { none: { contactDate: { gte: date45DaysAgo } } },
          },
        },
      }),
      this.prisma.careMilestone.count({
        where: { tenantId, status: { in: [MilestoneStatus.COMPLETED, MilestoneStatus.PENDING] } },
      }),
      this.prisma.careMilestone.count({
        where: { tenantId, status: MilestoneStatus.PENDING, expectedDate: { lt: new Date() } },
      }),
      this.prisma.patient.count({ where: { tenantId } }),
      this.prisma.patient.count({ where: { tenantId, followUpStage: PatientFollowUpStage.RE_ENGAGED } }),
      this.prisma.patientBarrier.count({ where: { tenantId } }),
      this.prisma.patientBarrier.count({ where: { tenantId, status: BarrierStatus.RESOLVED } }),
      this.prisma.patientBarrier.count({ where: { tenantId, isHospitalSide: true } }),
      this.prisma.patientBarrier.count({ where: { tenantId, isHospitalSide: false } }),
    ]);

    const careContinuityIndex = totalMilestones > 0 
      ? Math.round(((totalMilestones - overdueMilestones) / totalMilestones) * 100) 
      : 100;

    const stages = ['SCREENING', 'DIAGNOSIS', 'TREATMENT_PLANNING', 'ACTIVE_TREATMENT', 'SURVIVORSHIP'];
    const stageBreakdown: Record<string, number> = {};
    for (const stage of stages) {
      stageBreakdown[stage] = await this.prisma.careJourney.count({
        where: { tenantId, status: JourneyStatus.ACTIVE, careStage: stage as any },
      });
    }

    // Follow-up stage breakdown
    const followUpStages = Object.values(PatientFollowUpStage);
    const followUpStageBreakdown: Record<string, number> = {};
    for (const stg of followUpStages) {
      followUpStageBreakdown[stg] = await this.prisma.patient.count({
        where: { tenantId, followUpStage: stg },
      });
    }

    const barrierResolutionRate = totalBarriers > 0 ? Math.round((resolvedBarriers / totalBarriers) * 100) : 100;
    const reEngagementRate = totalPatients > 0 ? Math.round((reEngagedPatients / totalPatients) * 100) : 0;

    return {
      activeJourneysCount,
      lostToFollowUpCount,
      careContinuityIndex,
      stageBreakdown,
      followUpStageBreakdown,
      reEngagedPatients,
      reEngagementRate,
      barrierResolutionRate,
      totalBarriers,
      resolvedBarriers,
      hospitalSideBarriers,
      patientSideBarriers,
    };
  }

  async getInvestigationTAT(tenantId: string) {
    const investigations = await this.prisma.investigation.findMany({
      where: {
        tenantId,
        status: { in: [InvestigationStatus.REPORT_AVAILABLE, InvestigationStatus.REVIEWED] },
        turnaroundHours: { not: null },
      },
      select: { investigationType: true, turnaroundHours: true },
    });

    const stats: Record<string, { sum: number; count: number }> = {
      'CT Scan': { sum: 0, count: 0 },
      'MRI': { sum: 0, count: 0 },
      'PET Scan': { sum: 0, count: 0 },
      'Biopsy': { sum: 0, count: 0 },
      'Blood Test': { sum: 0, count: 0 },
    };

    investigations.forEach((inv) => {
      const type = inv.investigationType;
      const hours = inv.turnaroundHours || 0;
      if (!stats[type]) {
        stats[type] = { sum: hours, count: 1 };
      } else {
        stats[type].sum += hours;
        stats[type].count += 1;
      }
    });

    const result: Record<string, number> = {};
    for (const type in stats) {
      result[type] = stats[type].count > 0 ? Math.round((stats[type].sum / stats[type].count) * 10) / 10 : 0;
    }

    return result;
  }

  async getPracticeGrowthMetrics(tenantId: string) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const recentPatients = await this.prisma.patient.findMany({
      where: { tenantId, registeredAt: { gte: twelveMonthsAgo } },
      select: { registeredAt: true },
    });
    
    const newPatientsPerMonth: Record<string, number> = {};
    recentPatients.forEach(p => {
      const monthYear = `${p.registeredAt.getFullYear()}-${String(p.registeredAt.getMonth() + 1).padStart(2, '0')}`;
      newPatientsPerMonth[monthYear] = (newPatientsPerMonth[monthYear] || 0) + 1;
    });

    const activePatientsCount = await this.prisma.patient.count({
      where: { tenantId, status: 'ACTIVE' },
    });
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const activePatients = await this.prisma.patient.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: {
        id: true,
        _count: {
          select: {
            appointments: {
              where: { scheduledAt: { gte: sixMonthsAgo } },
            }
          }
        }
      }
    });
    
    const retainedPatientsCount = activePatients.filter(p => p._count.appointments >= 2).length;
    const retentionRate = activePatientsCount > 0 ? (retainedPatientsCount / activePatientsCount) * 100 : 0;

    const totalReferrals = await this.prisma.referral.count({ where: { tenantId } });
    const convertedReferrals = await this.prisma.referral.count({ where: { tenantId, convertedToJourney: true } });
    const referralConversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0;

    const feedbacks = await this.prisma.patientFeedback.aggregate({
      where: { tenantId },
      _avg: { overallRating: true },
    });
    const averageSatisfaction = feedbacks._avg.overallRating || 0;

    const completedAppointments = await this.prisma.appointment.count({
      where: { tenantId, status: AppointmentStatus.COMPLETED }
    });
    const nonCancelledAppointments = await this.prisma.appointment.count({
      where: { tenantId, status: { not: AppointmentStatus.CANCELLED } }
    });
    const appointmentCompletionRate = nonCancelledAppointments > 0 ? (completedAppointments / nonCancelledAppointments) * 100 : 0;

    return {
      newPatientsPerMonth,
      retentionRate,
      referralConversionRate,
      averageSatisfaction,
      appointmentCompletionRate
    };
  }

  async getServiceUtilization(tenantId: string) {
    const records = await this.prisma.serviceUtilization.findMany({
      where: { tenantId },
      orderBy: { month: 'asc' },
    });
    return records;
  }
}
