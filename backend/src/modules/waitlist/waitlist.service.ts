import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateWaitlistDto) {
    return this.prisma.waitlistEntry.create({
      data: {
        ...dto,
        tenantId,
        status: 'PENDING',
      } as any,
    });
  }

  async findAll(tenantId: string, departmentId?: string) {
    const where: any = { tenantId, status: 'PENDING' };
    if (departmentId) {
      where.departmentId = departmentId;
    }

    return this.prisma.waitlistEntry.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, mrn: true } },
        doctor: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      } as any,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async fulfill(tenantId: string, id: string) {
    return this.prisma.waitlistEntry.update({
      where: { id, tenantId } as any,
      data: { status: 'FULFILLED' } as any,
    });
  }

  async cancel(tenantId: string, id: string) {
    return this.prisma.waitlistEntry.update({
      where: { id, tenantId } as any,
      data: { status: 'CANCELLED' } as any,
    });
  }
}
