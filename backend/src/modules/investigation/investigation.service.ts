import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInvestigationDto } from './dto/create-investigation.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { InvestigationFilterDto } from './dto/investigation-filter.dto';
import { InvestigationStatus } from '@prisma/client';

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
        // notes mapped to resultSummary or somewhere else? The schema doesn't have 'notes' on Investigation but let's assume it's acceptable to ignore if not in schema, or put in resultSummary
        resultSummary: dto.notes, 
      },
    });
  }

  async findAll(tenantId: string, filterDto: InvestigationFilterDto) {
    const { page = 1, limit = 10, patientId, journeyId, investigationType, status, dateFrom, dateTo } = filterDto;
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

    const [data, total] = await Promise.all([
      this.prisma.investigation.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          orderedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { orderedAt: 'desc' },
      }),
      this.prisma.investigation.count({ where }),
    ]);

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

    return investigation;
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

    if (dto.status === InvestigationStatus.REPORT_AVAILABLE && investigation.status !== InvestigationStatus.REPORT_AVAILABLE) {
      const diffTime = Math.abs(new Date().getTime() - investigation.orderedAt.getTime());
      turnaroundHours = diffTime / (1000 * 60 * 60);
    }

    if (dto.status === InvestigationStatus.REVIEWED && investigation.status !== InvestigationStatus.REVIEWED) {
      reviewedById = userId;
    }

    return this.prisma.investigation.update({
      where: { id, tenantId },
      data: {
        ...dto,
        orderedAt: dto.orderedAt ? new Date(dto.orderedAt) : undefined,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
        reportGeneratedAt: dto.reportGeneratedAt ? new Date(dto.reportGeneratedAt) : undefined,
        reportAvailableAt: dto.reportAvailableAt ? new Date(dto.reportAvailableAt) : undefined,
        reviewedAt: dto.status === InvestigationStatus.REVIEWED ? new Date() : (dto.reviewedAt ? new Date(dto.reviewedAt) : undefined),
        reviewedById,
        turnaroundHours,
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
      averageTurnaroundHours: data.totalHours / data.count,
      count: data.count,
    }));
  }
}
