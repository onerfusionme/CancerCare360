import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventStatus } from '@prisma/client';

@Injectable()
export class JourneyEventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateEventDto) {
    return this.prisma.journeyEvent.create({
      data: {
        tenantId,
        createdById: userId,
        journeyId: dto.journeyId,
        patientId: dto.patientId,
        eventType: dto.eventType,
        eventDate: new Date(dto.eventDate),
        status: dto.status || EventStatus.PLANNED,
        departmentId: dto.departmentId,
        responsibleUserId: dto.responsibleUserId,
        source: dto.source,
        sourceSystem: dto.sourceSystem,
        metadata: dto.metadata,
        relatedDocumentId: dto.relatedDocumentId,
        relatedAppointmentId: dto.relatedAppointmentId,
        notes: dto.notes,
      },
    });
  }

  async findAll(tenantId: string, filterDto: EventFilterDto) {
    const { page = 1, limit = 10, journeyId, patientId, eventType, status, dateFrom, dateTo } = filterDto;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(journeyId && { journeyId }),
      ...(patientId && { patientId }),
      ...(eventType && { eventType }),
      ...(status && { status }),
      ...((dateFrom || dateTo) && {
        eventDate: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.journeyEvent.findMany({
        where,
        skip,
        take: limit,
        include: {
          responsibleUser: { select: { id: true, firstName: true, lastName: true } },
          department: { select: { id: true, name: true } },
          journey: { select: { id: true, diagnosisCategory: true, careStage: true } },
        },
        orderBy: { eventDate: 'desc' },
      }),
      this.prisma.journeyEvent.count({ where }),
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
    const event = await this.prisma.journeyEvent.findUnique({
      where: { id, tenantId },
      include: {
        responsibleUser: true,
        department: true,
        journey: true,
        patient: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        updatedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.prisma.journeyEvent.findUnique({
      where: { id, tenantId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const { status, eventDate, ...rest } = dto;
    return this.prisma.journeyEvent.update({
      where: { id, tenantId },
      data: {
        ...rest,
        ...(status && { status }),
        ...(eventDate && { eventDate: new Date(eventDate) }),
        updatedById: userId,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    const event = await this.prisma.journeyEvent.findUnique({
      where: { id, tenantId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return this.prisma.journeyEvent.update({
      where: { id, tenantId },
      data: { status: EventStatus.CANCELLED },
    });
  }
}
