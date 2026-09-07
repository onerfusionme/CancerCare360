import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { TreatmentFilterDto } from './dto/treatment-filter.dto';
import { TreatmentStatus } from '@prisma/client';

@Injectable()
export class TreatmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTreatmentDto) {
    return this.prisma.treatmentMilestone.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        journeyId: dto.journeyId,
        treatmentType: dto.treatmentType,
        cycleNumber: dto.cycleNumber,
        plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : null,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
        responsibleTeamId: dto.responsibleTeamId,
        notes: dto.notes,
        status: TreatmentStatus.PLANNED,
      },
    });
  }

  async findAll(tenantId: string, filterDto: TreatmentFilterDto) {
    const { page = 1, limit = 10, patientId, journeyId, treatmentType, status } = filterDto;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(patientId && { patientId }),
      ...(journeyId && { journeyId }),
      ...(treatmentType && { treatmentType }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.treatmentMilestone.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { firstName: true, lastName: true } },
          responsibleTeam: { select: { name: true } },
        },
        orderBy: { plannedDate: 'desc' },
      }),
      this.prisma.treatmentMilestone.count({ where }),
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
    const treatment = await this.prisma.treatmentMilestone.findUnique({
      where: { id, tenantId },
      include: {
        patient: true,
        journey: true,
        responsibleTeam: true,
      },
    });

    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }

    return treatment;
  }

  async update(tenantId: string, id: string, dto: UpdateTreatmentDto) {
    const treatment = await this.prisma.treatmentMilestone.findUnique({
      where: { id, tenantId },
    });

    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }

    return this.prisma.treatmentMilestone.update({
      where: { id, tenantId },
      data: {
        ...dto,
        plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : undefined,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        actualDate: dto.actualDate ? new Date(dto.actualDate) : undefined,
      },
    });
  }

  async getByPatient(tenantId: string, patientId: string) {
    const treatments = await this.prisma.treatmentMilestone.findMany({
      where: { tenantId, patientId },
      orderBy: { plannedDate: 'asc' },
    });

    return treatments.reduce((acc, curr) => {
      if (!acc[curr.treatmentType]) {
        acc[curr.treatmentType] = [];
      }
      acc[curr.treatmentType].push(curr);
      return acc;
    }, {} as Record<string, any[]>);
  }

  async getPlannedVsCompleted(tenantId: string) {
    const stats = await this.prisma.treatmentMilestone.groupBy({
      by: ['treatmentType', 'status'],
      where: { tenantId },
      _count: {
        _all: true,
      },
    });

    return stats;
  }
}
