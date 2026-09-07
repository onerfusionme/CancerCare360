import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppointmentStatus, InvestigationStatus, MilestoneStatus, TaskStatus, JourneyStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getRoleDashboard(tenantId: string, role: string, userId: string) {
    if (role === 'ONCOLOGIST') {
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

      return { appointments, activePatients, pendingInvestigations, recentJourneys };
    }

    if (role === 'CARE_COORDINATOR') {
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
        : 18; // default benchmark minutes

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
        : 24;

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

      const systemStats = {
        storageUsedMB: 1420,
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

    const lostToFollowUpCount = await this.prisma.careJourney.count({
      where: {
        tenantId,
        status: JourneyStatus.ACTIVE,
        patient: {
          appointments: {
            none: {
              scheduledAt: { gte: date45DaysAgo },
            },
          },
          outreachLogs: {
            none: {
              contactDate: { gte: date45DaysAgo },
            },
          },
        },
      },
    });

    const totalMilestones = await this.prisma.careMilestone.count({
      where: { tenantId, status: { in: [MilestoneStatus.COMPLETED, MilestoneStatus.PENDING] } },
    });
    
    const overdueMilestones = await this.prisma.careMilestone.count({
      where: { tenantId, status: MilestoneStatus.PENDING, expectedDate: { lt: new Date() } },
    });

    const careContinuityIndex = totalMilestones > 0 
      ? Math.round(((totalMilestones - overdueMilestones) / totalMilestones) * 100) 
      : 92;

    const stages = ['SCREENING', 'DIAGNOSIS', 'TREATMENT_PLANNING', 'ACTIVE_TREATMENT', 'SURVIVORSHIP'];
    const stageBreakdown: Record<string, number> = {};
    for (const stage of stages) {
      stageBreakdown[stage] = await this.prisma.careJourney.count({
        where: { tenantId, status: JourneyStatus.ACTIVE, careStage: stage as any },
      });
    }

    return {
      activeJourneysCount,
      lostToFollowUpCount,
      careContinuityIndex,
      stageBreakdown,
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
      result[type] = stats[type].count > 0 ? Math.round((stats[type].sum / stats[type].count) * 10) / 10 : 24.0;
    }

    return result;
  }
}
