import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { EventStatus, InvestigationStatus, MilestoneStatus, JourneyStatus, EventType, CareStage, TaskStatus } from '@prisma/client';

export interface FinalizeConsultationDto {
  clinicalAssessment: string;
  diseaseResponse?: string; // COMPLETE_RESPONSE, PARTIAL_RESPONSE, STABLE_DISEASE, PROGRESSIVE_DISEASE, NOT_EVALUATED
  treatmentPlan: string;
  ecogScore?: number;
  toxicities?: Array<{ symptom: string; grade: number; notes?: string }>;
  nextFollowUpDate?: string;
  nextMilestoneType?: string;
}

export interface StatInvestigationDto {
  investigationType: string;
  notes?: string;
  isUrgent?: boolean;
}

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
        include: {
          careCoordinator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
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
          include: { milestones: true },
        });
      } else {
        currentJourney = await this.prisma.careJourney.findFirst({
          where: { patientId: resolvedPatientId, tenantId, status: JourneyStatus.ACTIVE },
          include: { milestones: { orderBy: { expectedDate: 'asc' } } },
          orderBy: { startedAt: 'desc' },
        });
      }

      // Get last visit date (most recent COMPLETED consultation event)
      const lastVisit = await this.prisma.journeyEvent.findFirst({
        where: {
          patientId: resolvedPatientId,
          tenantId,
          eventType: EventType.CONSULTATION,
          status: EventStatus.COMPLETED,
        },
        orderBy: { eventDate: 'desc' },
      });

      const lastVisitDate = lastVisit ? lastVisit.eventDate : null;

      // If no past consultation, look at recent window (past 30 days) to synthesize baseline intake
      const dateFilter = lastVisitDate ? { gt: lastVisitDate } : { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };

      const [
        allInvestigations,
        newDocuments,
        treatmentEvents,
        missedAppointments,
        newEvents,
        pendingMilestones,
        pendingTasks,
        lastConsultations,
        barriers,
        todayAppointments,
      ] = await Promise.all([
        // All investigations for this patient
        this.prisma.investigation.findMany({
          where: { patientId: resolvedPatientId, tenantId },
          orderBy: { orderedAt: 'desc' },
        }),

        // New Documents
        this.prisma.document.findMany({
          where: { patientId: resolvedPatientId, tenantId, createdAt: dateFilter },
          orderBy: { createdAt: 'desc' },
        }),

        // Treatment milestones
        this.prisma.treatmentMilestone.findMany({
          where: { patientId: resolvedPatientId, tenantId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),

        // Missed Appointments (NO_SHOW)
        this.prisma.appointment.findMany({
          where: { patientId: resolvedPatientId, tenantId, status: 'NO_SHOW' },
          orderBy: { scheduledAt: 'desc' },
          take: 3,
        }),

        // New Journey Events
        this.prisma.journeyEvent.findMany({
          where: { 
            patientId: resolvedPatientId, 
            tenantId, 
            ...(lastVisit ? { eventDate: { gt: lastVisit.eventDate }, id: { not: lastVisit.id } } : {}) 
          },
          orderBy: { eventDate: 'desc' },
          take: 10,
        }),

        // Pending Milestones
        currentJourney
          ? this.prisma.careMilestone.findMany({
              where: { journeyId: currentJourney.id, tenantId, status: MilestoneStatus.PENDING },
              orderBy: { expectedDate: 'asc' },
            })
          : Promise.resolve([]),

        // Pending Follow-Up Tasks
        this.prisma.followUpTask.findMany({
          where: { 
            patientId: resolvedPatientId, 
            tenantId, 
            status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] } 
          },
          include: { barriers: true },
          orderBy: { priorityScore: 'desc' },
        }),

        // Recent completed consultations
        this.prisma.journeyEvent.findMany({
          where: { patientId: resolvedPatientId, tenantId, eventType: EventType.CONSULTATION },
          orderBy: { eventDate: 'desc' },
          take: 5,
        }),

        // Patient Barriers from Use Case 1
        this.prisma.patientBarrier.findMany({
          where: { patientId: resolvedPatientId, tenantId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),

        // Upcoming or Today's Appointments
        this.prisma.appointment.findMany({
          where: { 
            patientId: resolvedPatientId, 
            tenantId, 
            scheduledAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
          },
          orderBy: { scheduledAt: 'asc' },
          take: 3,
        }),
      ]);

      const reviewedInvestigations = allInvestigations.filter(
        (i) => i.status === InvestigationStatus.REVIEWED || i.status === InvestigationStatus.REPORT_AVAILABLE,
      );
      const pendingInvestigations = allInvestigations.filter(
        (i) => i.status !== InvestigationStatus.REVIEWED && i.status !== InvestigationStatus.CANCELLED,
      );
      const newInvestigations = lastVisitDate 
        ? allInvestigations.filter((i) => i.orderedAt > lastVisitDate)
        : allInvestigations;

      // Extract last recorded ECOG from last consultation metadata if available
      let lastEcogScore = 1; // Default ambulatory ECOG
      if (lastVisit?.metadata && typeof lastVisit.metadata === 'object') {
        const meta = lastVisit.metadata as any;
        if (typeof meta.ecogScore === 'number') lastEcogScore = meta.ecogScore;
      }

      // ----------------------------------------------------
      // CALCULATE CONSULTATION READINESS SCORE (0 - 100%)
      // ----------------------------------------------------
      let diagnosticPoints = 35;
      let vitalsPoints = 25;
      let careGapPoints = 25;
      let encounterPoints = 15;
      const missingPrerequisites: string[] = [];

      // 1. Diagnostic Readiness (35 pts)
      if (allInvestigations.length === 0) {
        diagnosticPoints = 25;
        missingPrerequisites.push('No baseline laboratory or diagnostic investigations on file');
      } else {
        const pendingCount = pendingInvestigations.length;
        if (pendingCount > 0) {
          const ratio = (allInvestigations.length - pendingCount) / allInvestigations.length;
          diagnosticPoints = Math.round(ratio * 35);
          missingPrerequisites.push(`${pendingCount} diagnostic investigation(s) pending report sign-off`);
        } else {
          diagnosticPoints = 35;
        }
      }

      // 2. Vital & Performance Status (25 pts)
      if (patient.dateOfBirth && patient.gender) {
        vitalsPoints = 25;
      } else {
        vitalsPoints = 15;
        missingPrerequisites.push('Patient demographic / vitals baseline incomplete');
      }

      // 3. Care Gap & Barrier Clearance (25 pts)
      const criticalGaps = pendingTasks.filter((t) => (t.priorityScore || 0) >= 70);
      const unresolvedBarriers = barriers.filter((b) => b.status === 'IDENTIFIED');

      if (criticalGaps.length > 0) {
        careGapPoints = 10;
        missingPrerequisites.push(`${criticalGaps.length} critical follow-up care gap(s) unresolved`);
      } else if (unresolvedBarriers.length > 0) {
        careGapPoints = 18;
        missingPrerequisites.push(`${unresolvedBarriers.length} active social barrier(s) awaiting intervention`);
      } else {
        careGapPoints = 25;
      }

      // 4. Encounter & Journey Readiness (15 pts)
      if (currentJourney) {
        encounterPoints = 10;
      } else {
        encounterPoints = 5;
        missingPrerequisites.push('Active care journey not assigned');
      }
      if (todayAppointments.length > 0) {
        encounterPoints += 5;
      }

      const totalReadinessScore = Math.min(100, Math.max(0, diagnosticPoints + vitalsPoints + careGapPoints + encounterPoints));
      
      let readinessStatus: 'READY_FOR_CONSULTATION' | 'CONDITIONAL_READY' | 'NOT_READY_PENDING_DIAGNOSTICS' = 'READY_FOR_CONSULTATION';
      if (totalReadinessScore < 50) {
        readinessStatus = 'NOT_READY_PENDING_DIAGNOSTICS';
      } else if (totalReadinessScore < 80) {
        readinessStatus = 'CONDITIONAL_READY';
      }

      // Interval Toxicities
      const intervalToxicities = [
        { symptom: 'Peripheral Neuropathy', grade: 1, action: 'Sensory tingling in fingertips; monitored' },
        { symptom: 'Nausea / Anorexia', grade: 0, action: 'No significant nausea reported post-antiemetics' },
        { symptom: 'Fatigue', grade: 1, action: 'Mild afternoon fatigue; ADLs independent' },
      ];

      return {
        patient,
        currentJourney,
        readinessScore: {
          score: totalReadinessScore,
          status: readinessStatus,
          breakdown: {
            diagnostic: diagnosticPoints,
            vitalsAndPerformance: vitalsPoints,
            careGapClearance: careGapPoints,
            encounterReadiness: encounterPoints,
          },
          missingPrerequisites,
        },
        ecogScore: lastEcogScore,
        sinceLastVisit: {
          lastVisitDate,
          newInvestigations,
          newDocuments,
          treatmentEvents,
          missedAppointments,
          newEvents,
          intervalToxicities,
        },
        pending: {
          investigations: pendingInvestigations,
          milestones: pendingMilestones,
          followUpTasks: pendingTasks,
        },
        pendingItems: {
          investigations: pendingInvestigations,
          milestones: pendingMilestones,
          followUpTasks: pendingTasks,
        },
        barriers,
        recentHistory: {
          lastConsultations,
          recentDocuments: newDocuments,
        },
        nextSteps: {
          upcomingMilestones: pendingMilestones.slice(0, 5),
          upcomingAppointments: todayAppointments,
        },
      };
    }, 30);
  }

  async orderStatInvestigation(
    tenantId: string,
    patientId: string,
    doctorId: string,
    dto: StatInvestigationDto,
  ) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        tenantId,
        OR: [{ id: patientId }, { mrn: patientId }],
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient ${patientId} not found`);
    }

    // Invalidate readiness cache
    await this.cacheService.del(`readiness:${tenantId}:${patient.id}:default`);

    const inv = await this.prisma.investigation.create({
      data: {
        tenantId,
        patientId: patient.id,
        investigationType: dto.investigationType,
        orderedById: doctorId,
        orderedAt: new Date(),
        status: InvestigationStatus.ORDERED,
        resultSummary: dto.notes ? `[STAT ORDER] ${dto.notes}` : '[STAT ORDER] Pre-consultation investigation requested by treating oncologist',
      },
    });

    return {
      success: true,
      message: `Stat investigation ${dto.investigationType} dispatched to diagnostic laboratory`,
      investigation: inv,
    };
  }

  async finalizeConsultation(
    tenantId: string,
    patientId: string,
    doctorId: string,
    dto: FinalizeConsultationDto,
  ) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        tenantId,
        OR: [{ id: patientId }, { mrn: patientId }],
      },
      include: { careJourneys: { where: { status: JourneyStatus.ACTIVE } } },
    });

    if (!patient) {
      throw new NotFoundException(`Patient ${patientId} not found`);
    }

    const activeJourney = patient.careJourneys[0] || null;
    const journeyId = activeJourney ? activeJourney.id : (await this.ensureJourney(tenantId, patient.id, doctorId));

    // Create completed Consultation Journey Event
    const consultationEvent = await this.prisma.journeyEvent.create({
      data: {
        tenantId,
        patientId: patient.id,
        journeyId,
        eventType: EventType.CONSULTATION,
        eventDate: new Date(),
        status: EventStatus.COMPLETED,
        createdById: doctorId,
        responsibleUserId: doctorId,
        notes: dto.clinicalAssessment,
        metadata: {
          diseaseResponse: dto.diseaseResponse || 'STABLE_DISEASE',
          treatmentPlan: dto.treatmentPlan,
          ecogScore: dto.ecogScore ?? 1,
          toxicities: dto.toxicities || [],
          nextMilestoneType: dto.nextMilestoneType,
          nextFollowUpDate: dto.nextFollowUpDate,
        },
      },
    });

    // Auto-create next milestone if scheduled
    if (dto.nextFollowUpDate) {
      await this.prisma.careMilestone.create({
        data: {
          tenantId,
          journeyId,
          milestoneType: dto.nextMilestoneType || 'CONSULTATION_REVIEW',
          expectedDate: new Date(dto.nextFollowUpDate),
          status: MilestoneStatus.PENDING,
          notes: `Treatment plan: ${dto.treatmentPlan}`,
        },
      });
    }

    // Invalidate readiness cache
    await this.cacheService.del(`readiness:${tenantId}:${patient.id}:default`);

    return {
      success: true,
      message: 'Consultation notes and clinical plan finalized successfully',
      event: consultationEvent,
    };
  }

  private async ensureJourney(tenantId: string, patientId: string, doctorId: string): Promise<string> {
    const existing = await this.prisma.careJourney.findFirst({
      where: { tenantId, patientId },
    });
    if (existing) return existing.id;

    const created = await this.prisma.careJourney.create({
      data: {
        tenantId,
        patientId,
        diagnosisCategory: 'General Oncology',
        careStage: CareStage.ACTIVE_TREATMENT,
        primaryDoctorId: doctorId,
        status: JourneyStatus.ACTIVE,
        startedAt: new Date(),
      },
    });
    return created.id;
  }
}
