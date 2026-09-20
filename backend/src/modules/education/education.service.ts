import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { EducationFilterDto } from './dto/education-filter.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class EducationService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createEducationDto: CreateEducationDto, userId: string) {
    return this.prisma.educationContent.create({
      data: {
        title: createEducationDto.title,
        category: createEducationDto.category,
        language: createEducationDto.language || 'en',
        body: createEducationDto.body,
        status: (createEducationDto.status as ContentStatus) || ContentStatus.DRAFT,
        targetDiagnosis: (createEducationDto as any).targetDiagnosis,
        targetCareStage: (createEducationDto as any).targetCareStage,
        tenantId,
        draftedById: userId,
      } as any,
    });
  }

  async findAll(tenantId: string, filter: EducationFilterDto) {
    const { category, language, status, search } = filter;
    
    const where: any = { tenantId };
    
    if (category) where.category = category;
    if (language) where.language = language;
    if (status) where.status = status as ContentStatus;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.educationContent.findMany({
      where,
      include: {
        draftedBy: { select: { id: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const education = await this.prisma.educationContent.findFirst({
      where: { id, tenantId },
      include: {
        draftedBy: { select: { id: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!education) throw new NotFoundException('Education content not found');
    return education;
  }

  async update(tenantId: string, id: string, updateEducationDto: UpdateEducationDto) {
    await this.findOne(tenantId, id);
    return this.prisma.educationContent.update({
      where: { id },
      data: {
        ...updateEducationDto,
        status: updateEducationDto.status ? (updateEducationDto.status as ContentStatus) : undefined,
        targetDiagnosis: (updateEducationDto as any).targetDiagnosis,
        targetCareStage: (updateEducationDto as any).targetCareStage,
      } as any,
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.educationContent.delete({
      where: { id },
    });
  }

  async submitForReview(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);
    return this.prisma.educationContent.update({
      where: { id },
      data: {
        status: ContentStatus.IN_REVIEW,
        reviewedById: userId,
      },
    });
  }

  async approve(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);
    return this.prisma.educationContent.update({
      where: { id },
      data: {
        status: ContentStatus.APPROVED,
        approvedById: userId,
      },
    });
  }

  async publish(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);
    return this.prisma.educationContent.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async archive(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.educationContent.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
  }

  async findPublished(tenantId: string, category?: string, language?: string) {
    const where: any = {
      tenantId,
      status: ContentStatus.PUBLISHED,
    };
    if (category) where.category = category;
    if (language) where.language = language;

    return this.prisma.educationContent.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });
  }
}
