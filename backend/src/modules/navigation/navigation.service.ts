import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBarrierDto } from './dto/create-barrier.dto';
import { UpdateBarrierDto, ResolveBarrierDto } from './dto/update-barrier.dto';
import { BarrierStatus, BarrierCategory, InterventionType } from '@prisma/client';

@Injectable()
export class NavigationService {
  constructor(private prisma: PrismaService) {}

  async createBarrier(tenantId: string, dto: CreateBarrierDto) {
    const barrier = await this.prisma.patientBarrier.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        taskId: dto.taskId || null,
        outreachLogId: dto.outreachLogId || null,
        category: dto.category,
        barrierDetail: dto.barrierDetail,
        isHospitalSide: dto.isHospitalSide ?? (dto.category === BarrierCategory.HOSPITAL_PROCESS),
        reportedBy: dto.reportedBy || 'PATIENT',
        interventionType: dto.interventionType || InterventionType.OTHER,
        interventionNotes: dto.interventionNotes || null,
        status: dto.status || BarrierStatus.IDENTIFIED,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
      },
    });

    if (dto.taskId) {
      await this.prisma.followUpTask.update({
        where: { id: dto.taskId, tenantId },
        data: {
          lastAction: "Barrier noted: " + dto.category,
          nextAction: "Deliver intervention: " + (dto.interventionType || 'Assessment'),
        },
      });
    }

    return barrier;
  }

  async updateBarrier(tenantId: string, id: string, dto: UpdateBarrierDto) {
    const existing = await this.prisma.patientBarrier.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Barrier record not found');

    return this.prisma.patientBarrier.update({
      where: { id },
      data: {
        ...(dto.interventionType && { interventionType: dto.interventionType }),
        ...(dto.interventionNotes !== undefined && { interventionNotes: dto.interventionNotes }),
        ...(dto.status && { status: dto.status }),
        ...(dto.status === BarrierStatus.RESOLVED && { resolvedAt: new Date() }),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
      },
    });
  }

  async resolveBarrier(tenantId: string, id: string, dto: ResolveBarrierDto) {
    const existing = await this.prisma.patientBarrier.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Barrier record not found');

    const updated = await this.prisma.patientBarrier.update({
      where: { id },
      data: {
        status: BarrierStatus.RESOLVED,
        resolvedAt: new Date(),
        interventionNotes: dto.resolutionNotes
          ? (existing.interventionNotes ? existing.interventionNotes + '\n' : '') + 'Resolution: ' + dto.resolutionNotes
          : existing.interventionNotes,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
      },
    });

    if (existing.taskId) {
      const remainingUnresolved = await this.prisma.patientBarrier.count({
        where: { taskId: existing.taskId, tenantId, status: { not: BarrierStatus.RESOLVED } },
      });

      if (remainingUnresolved === 0) {
        await this.prisma.followUpTask.update({
          where: { id: existing.taskId, tenantId },
          data: {
            lastAction: "Barrier resolved (" + existing.category + ")",
            nextAction: dto.recoveredAppointmentId ? 'Appointment recovered' : 'Confirm care completion',
          },
        });
      }
    }

    return updated;
  }

  async getPatientBarriers(tenantId: string, patientId: string) {
    return this.prisma.patientBarrier.findMany({
      where: { tenantId, patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        task: { select: { id: true, taskType: true, issueDescription: true, priority: true } },
        outreachLog: { select: { id: true, channel: true, outcome: true, contactDate: true } },
      },
    });
  }

  async getBarrierAnalytics(tenantId: string) {
    const [allBarriers, totalCount, resolvedCount] = await Promise.all([
      this.prisma.patientBarrier.findMany({
        where: { tenantId },
        select: {
          id: true,
          category: true,
          isHospitalSide: true,
          status: true,
          interventionType: true,
        },
      }),
      this.prisma.patientBarrier.count({ where: { tenantId } }),
      this.prisma.patientBarrier.count({ where: { tenantId, status: BarrierStatus.RESOLVED } }),
    ]);

    const byCategory: Record<string, number> = {};
    const byIntervention: Record<string, number> = {};
    let hospitalSideCount = 0;
    let patientSideCount = 0;

    for (const b of allBarriers) {
      byCategory[b.category] = (byCategory[b.category] || 0) + 1;
      if (b.interventionType) {
        byIntervention[b.interventionType] = (byIntervention[b.interventionType] || 0) + 1;
      }
      if (b.isHospitalSide) hospitalSideCount++;
      else patientSideCount++;
    }

    const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

    return {
      totalBarriers: totalCount,
      resolvedBarriers: resolvedCount,
      activeBarriers: totalCount - resolvedCount,
      resolutionRate,
      hospitalSideCount,
      patientSideCount,
      byCategory,
      byIntervention,
    };
  }

  async getOperationalBottlenecks(tenantId: string) {
    const [hospitalBarriers, patientBarriers] = await Promise.all([
      this.prisma.patientBarrier.findMany({
        where: { tenantId, isHospitalSide: true },
        include: { patient: { select: { id: true, firstName: true, lastName: true, mrn: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.patientBarrier.findMany({
        where: { tenantId, isHospitalSide: false },
        include: { patient: { select: { id: true, firstName: true, lastName: true, mrn: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      summary: {
        totalHospitalSide: hospitalBarriers.length,
        totalPatientSide: patientBarriers.length,
        ratio: patientBarriers.length > 0
          ? (hospitalBarriers.length / (hospitalBarriers.length + patientBarriers.length)).toFixed(2)
          : '0.00',
      },
      hospitalBottlenecks: hospitalBarriers,
      patientBarriers,
    };
  }
}
