import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOutreachDto, OutreachOutcome } from './dto/create-outreach.dto';

@Injectable()
export class OutreachService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateOutreachDto) {
    const contactDate = dto.contactDate ? new Date(dto.contactDate) : new Date();
    
    const outreach = await this.prisma.outreachLog.create({
      data: {
        ...dto,
        tenantId,
        contactedById: userId,
        contactDate,
      } as any,
    });

    if (dto.outcome === OutreachOutcome.RESOLVED) {
       await this.prisma.followUpTask.update({
          where: { id: dto.taskId, tenantId } as any,
          data: {
             status: 'RESOLVED',
             resolvedAt: new Date(),
             resolvedById: userId,
          } as any,
       });
    }

    return outreach;
  }

  async findByTask(tenantId: string, taskId: string) {
    return this.prisma.outreachLog.findMany({
      where: { tenantId, taskId } as any,
      orderBy: { contactDate: 'desc' },
      include: { contactedBy: { select: { id: true, firstName: true, lastName: true } } } as any,
    });
  }

  async findByPatient(tenantId: string, patientId: string) {
    return this.prisma.outreachLog.findMany({
      where: { tenantId, patientId } as any,
      orderBy: { contactDate: 'desc' },
      include: { 
         contactedBy: { select: { id: true, firstName: true, lastName: true } },
         task: { select: { id: true, taskType: true, issueDescription: true } }
      } as any,
    });
  }

  async getContactHistory(tenantId: string, patientId: string) {
    const logs = await this.prisma.outreachLog.findMany({
      where: { tenantId, patientId } as any,
    });

    const summary = logs.reduce((acc, log) => {
       const channel = (log as any).channel;
       if (!acc[channel]) acc[channel] = 0;
       acc[channel]++;
       return acc;
    }, {} as Record<string, number>);

    return summary;
  }
}
