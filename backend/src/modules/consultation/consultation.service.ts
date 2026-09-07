import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { EventStatus, InvestigationStatus, MilestoneStatus, JourneyStatus, EventType } from '@prisma/client';

@Injectable()
export class ConsultationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getReadiness(tenantId: string, patientId: string, journeyId?: string) {
    const cacheKey = `readiness:${tenantId}:${patientId}:${journeyId || 'default'}`;
    return this.cacheService.getOrSet(cacheKey, async () => {
      const patient = await this.prisma.patient.findFirst({
        where: {
          tenantId,
          OR: [
            { id: patientId },
            { mrn: patientId },
          ],
        },
      });

      if (!patient) {
        throw new NotFoundException(`Patient ${patientId} not found`);
      }

      const resolvedPatientId = patient.id;

    // Get current journey if not provided
    let currentJourney = null;
    if (journeyId) {
      currentJourney = await this.prisma.careJourney.findUnique({
        where: { id: journeyId, tenantId },
      });
    } else {
      currentJourney = await this.prisma.careJourney.findFirst({
        where: { patientId, tenantId, status: JourneyStatus.ACTIVE },
        orderBy: { startedAt: 'desc' },
      });
    }

    // Get last visit date (most recent COMPLETED consultation event)
    const lastVisit = await this.prisma.journeyEvent.findFirst({
      where: {
        patientId,
        tenantId,
        eventType: EventType.CONSULTATION,
        status: EventStatus.COMPLETED,
      },
      orderBy: { eventDate: 'desc' },
    });

    const lastVisitDate = lastVisit ? lastVisit.eventDate : null;

    // Queries based on lastVisitDate
    const dateFilter = lastVisitDate ? { gt: lastVisitDate } : undefined;

    const [
      newInvestigations,
      newDocuments,
      treatmentEvents,
      missedAppointments,
      newEvents,
      pendingInvestigations,
      pendingMilestones,
      pendingTasks,
      lastConsultations,
      recentMilestones,
      recentDocuments,
      upcomingMilestones,
      upcomingAppointments,
    ] = await Promise.all([
      // newInvestigations
      dateFilter ? this.prisma.investigation.findMany({
        where: { patientId: resolvedPatientId, tenantId, status: InvestigationStatus.REVIEWED, reviewedAt: dateFilter },
      }) : Promise.resolve([]),

      // newDocuments
      dateFilter ? this.prisma.document.findMany({
        where: { patientId: resolvedPatientId, tenantId, createdAt: dateFilter },
      }) : Promise.resolve([]),

      // treatmentEvents
      dateFilter ? this.prisma.treatmentMilestone.findMany({
        where: { patientId: resolvedPatientId, tenantId, actualDate: dateFilter },
      }) : Promise.resolve([]),

      // missedAppointments
      dateFilter ? this.prisma.appointment.findMany({
        where: { patientId: resolvedPatientId, tenantId, status: 'NO_SHOW', scheduledAt: dateFilter },
      }) : Promise.resolve([]),

      // newEvents
      dateFilter ? this.prisma.journeyEvent.findMany({
        where: { patientId: resolvedPatientId, tenantId, eventDate: dateFilter, id: { not: lastVisit?.id } },
      }) : Promise.resolve([]),

      // pendingInvestigations
      this.prisma.investigation.findMany({
        where: { patientId: resolvedPatientId, tenantId, status: { notIn: [InvestigationStatus.REVIEWED, InvestigationStatus.CANCELLED] } },
      }),

      // pendingMilestones
      currentJourney ? this.prisma.careMilestone.findMany({
        where: { journeyId: currentJourney.id, tenantId, status: MilestoneStatus.PENDING },
      }) : Promise.resolve([]),

      // pendingTasks
      this.prisma.followUpTask.findMany({
        where: { patientId: resolvedPatientId, tenantId, status: { notIn: ['COMPLETED', 'CANCELLED', 'RESOLVED'] as any[] } },
      }),

      // lastConsultations
      this.prisma.journeyEvent.findMany({
        where: { patientId: resolvedPatientId, tenantId, eventType: EventType.CONSULTATION },
        orderBy: { eventDate: 'desc' },
        take: 5,
      }),

      // recentMilestones
      currentJourney ? this.prisma.careMilestone.findMany({
        where: { journeyId: currentJourney.id, tenantId, status: MilestoneStatus.COMPLETED },
        orderBy: { actualDate: 'desc' },
        take: 10,
      }) : Promise.resolve([]),

      // recentDocuments
      this.prisma.document.findMany({
        where: { patientId: resolvedPatientId, tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // upcomingMilestones
      currentJourney ? this.prisma.careMilestone.findMany({
        where: { journeyId: currentJourney.id, tenantId, status: MilestoneStatus.PENDING, expectedDate: { gte: new Date() } },
        orderBy: { expectedDate: 'asc' },
        take: 5,
      }) : Promise.resolve([]),

      // upcomingAppointments
      this.prisma.appointment.findMany({
        where: { patientId: resolvedPatientId, tenantId, scheduledAt: { gte: new Date() }, status: { in: ['SCHEDULED', 'CONFIRMED'] } },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
    ]);

    return {
      patient,
      currentJourney,
      sinceLastVisit: {
        lastVisitDate,
        newInvestigations,
        newDocuments,
        treatmentEvents,
        missedAppointments,
        newEvents,
      },
      pending: {
        investigations: pendingInvestigations,
        milestones: pendingMilestones,
        followUpTasks: pendingTasks,
      },
      recentHistory: {
        lastConsultations,
        recentMilestones,
        recentDocuments,
      },
      nextSteps: {
        upcomingMilestones,
        upcomingAppointments,
      },
    };
    }, 900); // 15 min cache TTL
  }
}
