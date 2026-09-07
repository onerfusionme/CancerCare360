import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateScheduleDto) {
    return this.prisma.doctorSchedule.create({
      data: {
        ...dto,
        tenantId,
        isActive: true,
      } as any,
    });
  }

  async findByDoctor(tenantId: string, doctorId: string) {
    return this.prisma.doctorSchedule.findMany({
      where: { tenantId, doctorId } as any,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findByDepartment(tenantId: string, departmentId: string) {
    const schedules = await this.prisma.doctorSchedule.findMany({
      where: { tenantId, departmentId, isActive: true } as any,
      include: {
        doctor: { select: { id: true, name: true } },
      } as any,
    });

    const grouped = schedules.reduce((acc, curr) => {
      const docId = (curr as any).doctorId;
      if (!acc[docId]) {
        acc[docId] = {
          doctor: (curr as any).doctor,
          schedules: [],
        };
      }
      acc[docId].schedules.push(curr);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }

  async update(tenantId: string, id: string, dto: UpdateScheduleDto) {
    return this.prisma.doctorSchedule.update({
      where: { id, tenantId } as any,
      data: dto,
    });
  }

  async deactivate(tenantId: string, id: string) {
    return this.prisma.doctorSchedule.update({
      where: { id, tenantId } as any,
      data: { isActive: false },
    });
  }
}
