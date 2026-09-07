import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateJourneyDto } from './dto/create-journey.dto';
import { UpdateJourneyDto } from './dto/update-journey.dto';
import { JourneyFilterDto } from './dto/journey-filter.dto';
import { JourneyStatus, MilestoneStatus } from '@prisma/client';

@Injectable()
export class JourneyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateJourneyDto) {
    const journey = await this.prisma.careJourney.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        diagnosisCategory: dto.diagnosisCategory,
        careStage: dto.careStage,
        primaryDoctorId: dto.primaryDoctorId,
        careTeamId: dto.careTeamId,
        startedAt: new Date(dto.startedAt),
        status: JourneyStatus.ACTIVE,
      },
    });

    const templates = await this.prisma.milestoneTemplate.findMany({
      where: {
        tenantId,
        diagnosisCategory: dto.diagnosisCategory,
        isActive: true,
      },
    });

    if (templates.length > 0) {
      const milestonesToCreate = templates.map((template) => {
        const expectedDate = new Date(dto.startedAt);
        expectedDate.setDate(expectedDate.getDate() + template.defaultIntervalDays * template.sequence);
        return {
          tenantId,
          journeyId: journey.id,
          milestoneType: template.milestoneType,
          expectedDate,
          status: MilestoneStatus.PENDING,
        };
      });

      await this.prisma.careMilestone.createMany({
        data: milestonesToCreate,
      });
    }

    return journey;
  }

  async findAll(tenantId: string, filterDto: JourneyFilterDto) {
    const { page = 1, limit = 10, patientId, diagnosisCategory, careStage, status, primaryDoctorId } = filterDto;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(patientId && { patientId }),
      ...(diagnosisCategory && { diagnosisCategory }),
      ...(careStage && { careStage }),
      ...(status && { status }),
      ...(primaryDoctorId && { primaryDoctorId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.careJourney.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { firstName: true, lastName: true } },
          primaryDoctor: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.careJourney.count({ where }),
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
    const journey = await this.prisma.careJourney.findUnique({
      where: { id, tenantId },
      include: {
        events: {
          take: 10,
          orderBy: { eventDate: 'desc' },
        },
        milestones: true,
        patient: true,
        primaryDoctor: true,
        careTeam: true,
      },
    });

    if (!journey) {
      throw new NotFoundException(`Journey with ID ${id} not found`);
    }

    return journey;
  }

  async update(tenantId: string, id: string, dto: UpdateJourneyDto) {
    const existing = await this.prisma.careJourney.findUnique({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Journey with ID ${id} not found`);
    }

    if (existing.status === JourneyStatus.COMPLETED && dto.status && dto.status !== JourneyStatus.COMPLETED) {
      throw new BadRequestException('Cannot reopen a completed journey');
    }

    return this.prisma.careJourney.update({
      where: { id, tenantId },
      data: {
        ...dto,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
      },
    });
  }

  async getTimeline(tenantId: string, journeyId: string) {
    return this.prisma.journeyEvent.findMany({
      where: { tenantId, journeyId },
      orderBy: { eventDate: 'desc' },
      include: {
        responsibleUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getPatientTimeline(tenantId: string, patientId: string) {
    return this.prisma.journeyEvent.findMany({
      where: { tenantId, patientId },
      orderBy: { eventDate: 'desc' },
      include: {
        journey: { select: { diagnosisCategory: true } },
        responsibleUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async close(tenantId: string, id: string) {
    const journey = await this.prisma.careJourney.findUnique({
      where: { id, tenantId },
    });

    if (!journey) {
      throw new NotFoundException(`Journey with ID ${id} not found`);
    }

    await this.prisma.careMilestone.updateMany({
      where: {
        tenantId,
        journeyId: id,
        status: MilestoneStatus.PENDING,
      },
      data: {
        status: MilestoneStatus.CANCELLED,
      },
    });

    return this.prisma.careJourney.update({
      where: { id, tenantId },
      data: { status: JourneyStatus.COMPLETED },
    });
  }
}
