import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateConflictDto } from './dto/create-conflict.dto';

@Injectable()
export class DataConflictService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateConflictDto) {
    return this.prisma.dataConflict.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        fieldName: dto.fieldName,
        sourceA: dto.sourceA,
        valueA: dto.valueA,
        sourceB: dto.sourceB,
        valueB: dto.valueB,
      },
    });
  }

  async findAll(tenantId: string, patientId?: string) {
    return this.prisma.dataConflict.findMany({
      where: {
        tenantId,
        resolvedAt: null,
        ...(patientId && { patientId }),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(tenantId: string, id: string, userId: string, resolution: string) {
    const conflict = await this.prisma.dataConflict.findUnique({
      where: { id, tenantId },
    });

    if (!conflict) {
      throw new NotFoundException(`Data conflict with ID ${id} not found`);
    }

    // Creating an audit log is explicitly requested in the problem description
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'RESOLVE_CONFLICT',
        resourceType: 'DataConflict',
        resourceId: id,
        previousValue: conflict as any,
        newValue: { resolution } as any,
      },
    });

    return this.prisma.dataConflict.update({
      where: { id, tenantId },
      data: {
        resolvedById: userId,
        resolvedAt: new Date(),
        resolution,
      },
    });
  }

  async findByPatient(tenantId: string, patientId: string) {
    return this.prisma.dataConflict.findMany({
      where: { tenantId, patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        resolvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
