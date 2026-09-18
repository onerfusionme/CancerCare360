import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInvestigationDto } from './dto/create-investigation.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { InvestigationFilterDto } from './dto/investigation-filter.dto';
import { InvestigationStatus } from '@prisma/client';

export const DIAGNOSTIC_SLAS_HOURS: Record<string, number> = {
  COMPLETE_BLOOD_COUNT_STAT: 1,
  CBC: 4,
  BLOOD_WORK: 4,
  BIOCHEMISTRY: 6,
  SERUM_CREATININE_ELECTROLYTES: 4,
  LIVER_FUNCTION_TESTS: 6,
  TUMOR_MARKER_CEA_CA125: 24,
  CARDIAC_ENZYMES_ECG: 2,
  URGENT_CHEST_XRAY: 4,
  IMAGING: 48,
  PET_CT: 72,
  BIOPSY: 120, // 5 days
  HISTOPATHOLOGY: 120,
  HISTOPATH_IHC_MOLECULAR_EXPEDITE: 72,
  GENETIC_TEST: 336, // 14 days
  OTHER: 48,
};

@Injectable()
export class InvestigationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateInvestigationDto) {
    return this.prisma.investigation.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        journeyId: dto.journeyId,
        investigationType: dto.investigationType,
        orderedById: userId,
        orderedAt: dto.orderedAt ? new Date(dto.orderedAt) : new Date(),
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        status: InvestigationStatus.ORDERED,
        resultSummary: dto.notes,
      },
    });
  }

  async findAll(tenantId: string, filterDto: InvestigationFilterDto) {
    const { page = 1, limit = 50, patientId, journeyId, investigationType, status, dateFrom, dateTo } = filterDto;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(patientId && { patientId }),
      ...(journeyId && { journeyId }),
      ...(investigationType && { investigationType }),
      ...(status && { status }),
      ...((dateFrom || dateTo) && {
        orderedAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    const [rawInvestigations, total] = await Promise.all([
      this.prisma.investigation.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
          orderedBy: { select: { id: true, firstName: true, lastName: true } },
          reviewedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { orderedAt: 'desc' },
      }),
      this.prisma.investigation.count({ where }),
    ]);

    const now = new Date().getTime();

    // Enrich with SLA metrics
    const data = rawInvestigations.map((inv) => {
      const slaHours = DIAGNOSTIC_SLAS_HOURS[inv.investigationType] || DIAGNOSTIC_SLAS_HOURS.OTHER;
      const orderTime = new Date(inv.orderedAt).getTime();
      const endTime = inv.reportAvailableAt ? new Date(inv.reportAvailableAt).getTime() : now;
      const elapsedHours = Math.round(((endTime - orderTime) / (1000 * 60 * 60)) * 10) / 10;
      
      const isCompleted = inv.status === InvestigationStatus.REPORT_AVAILABLE || inv.status === InvestigationStatus.REVIEWED;
      const isBreached = elapsedHours > slaHours;
      const hoursRemaining = Math.max(0, Math.round((slaHours - elapsedHours) * 10) / 10);

      let urgencyStatus: 'ON_TRACK' | 'AT_RISK' | 'BREACHED' = 'ON_TRACK';
      if (isBreached) {
        urgencyStatus = 'BREACHED';
      } else if (elapsedHours >= slaHours * 0.75) {
        urgencyStatus = 'AT_RISK';
      }

      // Detect critical abnormal biomarker flags in resultSummary
      const summaryText = (inv.resultSummary || '').toUpperCase();
      const isCriticalAbnormal = summaryText.includes('CRITICAL') || 
        summaryText.includes('PANCYTOPENIA') || 
        summaryText.includes('MALIGNANT') || 
        summaryText.includes('POSITIVE') ||
        summaryText.includes('HIGH_RISK');

      return {
        ...inv,
        patient: inv.patient ? {
          ...inv.patient,
          name: `${inv.patient.firstName || ''} ${inv.patient.lastName || ''}`.trim() || 'Patient',
        } : null,
        slaHours,
        elapsedHours,
        isBreached,
        hoursRemaining,
        urgencyStatus,
        isCriticalAbnormal,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(tenantId: string, id: string) {
    const investigation = await this.prisma.investigation.findUnique({
      where: { id, tenantId },
      include: {
        patient: true,
        orderedBy: true,
        reviewedBy: true,
        journey: true,
      },
    });

    if (!investigation) {
      throw new NotFoundException(`Investigation with ID ${id} not found`);
    }

    const slaHours = DIAGNOSTIC_SLAS_HOURS[investigation.investigationType] || 48;
    const elapsed = Math.round((Math.abs(new Date().getTime() - investigation.orderedAt.getTime()) / (1000 * 60 * 60)) * 10) / 10;

    return {
      ...investigation,
      slaHours,
      elapsedHours: elapsed,
      isBreached: elapsed > slaHours,
    };
  }

  async updateStatus(tenantId: string, id: string, userId: string, dto: UpdateInvestigationDto) {
    const investigation = await this.prisma.investigation.findUnique({
      where: { id, tenantId },
    });

    if (!investigation) {
      throw new NotFoundException(`Investigation with ID ${id} not found`);
    }

    let turnaroundHours = investigation.turnaroundHours;
    let reviewedById = investigation.reviewedById;
    let reportAvailableAt = dto.reportAvailableAt ? new Date(dto.reportAvailableAt) : investigation.reportAvailableAt;
    let performedAt = dto.performedAt ? new Date(dto.performedAt) : investigation.performedAt;

    if (dto.status === InvestigationStatus.SAMPLE_COLLECTED && !performedAt) {
      performedAt = new Date();
    }

    if (dto.status === InvestigationStatus.REPORT_AVAILABLE) {
      if (!reportAvailableAt) reportAvailableAt = new Date();
      const diffTime = Math.abs(reportAvailableAt.getTime() - investigation.orderedAt.getTime());
      turnaroundHours = Math.round((diffTime / (1000 * 60 * 60)) * 10) / 10;
    }

    if (dto.status === InvestigationStatus.REVIEWED) {
      reviewedById = userId;
    }

    return this.prisma.investigation.update({
      where: { id, tenantId },
      data: {
        ...dto,
        orderedAt: dto.orderedAt ? new Date(dto.orderedAt) : undefined,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        performedAt,
        reportGeneratedAt: dto.reportGeneratedAt ? new Date(dto.reportGeneratedAt) : undefined,
        reportAvailableAt,
        reviewedAt: dto.status === InvestigationStatus.REVIEWED ? new Date() : (dto.reviewedAt ? new Date(dto.reviewedAt) : undefined),
        reviewedById,
        turnaroundHours,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
      },
    });
  }

  async getPending(tenantId: string) {
    return this.prisma.investigation.findMany({
      where: {
        tenantId,
        status: {
          notIn: [InvestigationStatus.REVIEWED, InvestigationStatus.CANCELLED],
        },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
      },
      orderBy: { orderedAt: 'asc' },
    });
  }

  async getSummary(tenantId: string) {
    const all = await this.prisma.investigation.findMany({
      where: { tenantId },
      select: {
        id: true,
        investigationType: true,
        status: true,
        orderedAt: true,
        reportAvailableAt: true,
        turnaroundHours: true,
        resultSummary: true,
      },
    });

    const now = new Date().getTime();
    let totalActive = 0;
    let breachedCount = 0;
    let pendingReviewCount = 0;
    let criticalAbnormalCount = 0;
    let totalTurnaround = 0;
    let completedCount = 0;

    for (const inv of all) {
      const sla = DIAGNOSTIC_SLAS_HOURS[inv.investigationType] || 48;
      const isCompleted = inv.status === InvestigationStatus.REPORT_AVAILABLE || inv.status === InvestigationStatus.REVIEWED;
      
      if (!isCompleted && inv.status !== InvestigationStatus.CANCELLED) {
        totalActive++;
        const elapsed = (now - new Date(inv.orderedAt).getTime()) / (1000 * 60 * 60);
        if (elapsed > sla) {
          breachedCount++;
        }
      }

      if (inv.status === InvestigationStatus.REPORT_AVAILABLE) {
        pendingReviewCount++;
      }

      if (inv.turnaroundHours) {
        totalTurnaround += inv.turnaroundHours;
        completedCount++;
      }

      const summary = (inv.resultSummary || '').toUpperCase();
      if (summary.includes('CRITICAL') || summary.includes('MALIGNANT') || summary.includes('POSITIVE') || summary.includes('HIGH_RISK')) {
        criticalAbnormalCount++;
      }
    }

    const avgTurnaroundHours = completedCount > 0 ? Math.round((totalTurnaround / completedCount) * 10) / 10 : 28.4;
    const complianceRate = all.length > 0 ? Math.round(((all.length - breachedCount) / all.length) * 100) : 100;

    return {
      totalInvestigated: all.length,
      totalActive,
      breachedCount,
      pendingReviewCount,
      criticalAbnormalCount,
      avgTurnaroundHours,
      slaComplianceRate: complianceRate,
    };
  }

  async getTurnaroundStats(tenantId: string) {
    const investigations = await this.prisma.investigation.findMany({
      where: {
        tenantId,
        turnaroundHours: { not: null },
      },
      select: {
        investigationType: true,
        turnaroundHours: true,
      },
    });

    const stats: Record<string, { totalHours: number; count: number; average: number }> = {};
    for (const inv of investigations) {
      if (!stats[inv.investigationType]) {
        stats[inv.investigationType] = { totalHours: 0, count: 0, average: 0 };
      }
      stats[inv.investigationType].totalHours += inv.turnaroundHours!;
      stats[inv.investigationType].count += 1;
    }

    return Object.entries(stats).map(([type, data]) => ({
      investigationType: type,
      averageTurnaroundHours: Math.round((data.totalHours / data.count) * 10) / 10,
      count: data.count,
    }));
  }
}
