import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { MilestoneStatus } from '@prisma/client';

@Injectable()
export class MilestoneService {
  constructor(private readonly prisma: PrismaService) {}

  async createMilestone(tenantId: string, dto: CreateMilestoneDto) {
    return this.prisma.careMilestone.create({
      data: {
        tenantId,
        journeyId: dto.journeyId,
        milestoneType: dto.milestoneType,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
        responsibleUserId: dto.responsibleUserId,
        notes: dto.notes,
        status: MilestoneStatus.PENDING,
      },
    });
  }

  async updateMilestone(tenantId: string, id: string, dto: UpdateMilestoneDto) {
    const milestone = await this.prisma.careMilestone.findUnique({
      where: { id, tenantId },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    let actualDate = milestone.actualDate;
    if (dto.status === MilestoneStatus.COMPLETED && !milestone.actualDate && !dto.actualDate) {
      actualDate = new Date();
    } else if (dto.actualDate) {
      actualDate = new Date(dto.actualDate);
    }

    return this.prisma.careMilestone.update({
      where: { id, tenantId },
      data: {
        ...dto,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        actualDate,
      },
    });
  }

  async getMilestonesByJourney(tenantId: string, journeyId: string) {
    const milestones = await this.prisma.careMilestone.findMany({
      where: { tenantId, journeyId },
      orderBy: { expectedDate: 'asc' },
      include: {
        responsibleUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return milestones.map((m) => {
      let daysOverdue = 0;
      if (m.status === MilestoneStatus.PENDING && m.expectedDate) {
        const diffTime = Math.abs(new Date().getTime() - m.expectedDate.getTime());
        if (new Date() > m.expectedDate) {
          daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }
      return {
        ...m,
        daysOverdue,
      };
    });
  }

  async getOverdueMilestones(tenantId: string) {
    return this.prisma.careMilestone.findMany({
      where: {
        tenantId,
        status: MilestoneStatus.PENDING,
        expectedDate: {
          lt: new Date(),
        },
      },
      include: {
        journey: {
          include: {
            patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
          },
        },
        responsibleUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { expectedDate: 'asc' },
    });
  }

  async createTemplate(tenantId: string, dto: CreateTemplateDto) {
    return this.prisma.milestoneTemplate.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async getTemplates(tenantId: string, diagnosisCategory?: string) {
    return this.prisma.milestoneTemplate.findMany({
      where: {
        tenantId,
        ...(diagnosisCategory && { diagnosisCategory }),
      },
      orderBy: [
        { diagnosisCategory: 'asc' },
        { sequence: 'asc' },
      ],
    });
  }

  async updateTemplate(tenantId: string, id: string, dto: Partial<CreateTemplateDto>) {
    const template = await this.prisma.milestoneTemplate.findUnique({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return this.prisma.milestoneTemplate.update({
      where: { id, tenantId },
      data: dto,
    });
  }

  async generateMilestonesFromTemplates(tenantId: string, journeyId: string, diagnosisCategory: string, startDate: Date) {
    const templates = await this.getTemplates(tenantId, diagnosisCategory);

    if (templates.length === 0) return [];

    const milestones = templates.filter(t => t.isActive).map(template => {
      const expectedDate = new Date(startDate);
      expectedDate.setDate(expectedDate.getDate() + template.defaultIntervalDays * template.sequence);
      return {
        tenantId,
        journeyId,
        milestoneType: template.milestoneType,
        expectedDate,
        status: MilestoneStatus.PENDING,
      };
    });

    await this.prisma.careMilestone.createMany({
      data: milestones,
    });

    return milestones;
  }
}
