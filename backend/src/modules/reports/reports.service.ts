import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(tenantId: string, userId: string, dto: GenerateReportDto) {
    let data: any[] = [];
    
    if (dto.reportType === 'PATIENT_CENSUS') {
      const whereClause: any = { tenantId };
      if (dto.departmentId) whereClause.departmentId = dto.departmentId;
      if (dto.dateFrom && dto.dateTo) {
        whereClause.createdAt = { gte: new Date(dto.dateFrom), lte: new Date(dto.dateTo) };
      }
      data = await (this.prisma as any).patient.findMany({ where: whereClause });
    } else if (dto.reportType === 'CARE_GAPS') {
      data = await (this.prisma as any).careGap.findMany({
        where: { tenantId },
        include: { patient: true },
      });
    } else if (dto.reportType === 'INVESTIGATION_TAT') {
      data = await (this.prisma as any).investigation.findMany({
        where: { tenantId },
        include: { patient: true },
      });
    } else if (dto.reportType === 'TREATMENT_COMPLETION') {
      data = await (this.prisma as any).careJourney.findMany({
        where: { tenantId, status: 'COMPLETED' },
        include: { patient: true },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EXPORT_CLINICAL_REPORT',
        resourceType: dto.reportType,
        newValue: { dateFrom: dto.dateFrom, dateTo: dto.dateTo, departmentId: dto.departmentId, format: dto.format } as any,
      },
    });

    let content = '';
    let mimeType = '';
    let fileName = `${dto.reportType}_${new Date().toISOString()}`;

    if (dto.format === 'CSV') {
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(val => typeof val === 'object' ? JSON.stringify(val) : val).join(','));
        content = [headers, ...rows].join('\n');
      } else {
        content = 'No data';
      }
      mimeType = 'text/csv';
      fileName += '.csv';
    } else {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileName += '.json';
    }

    return { fileName, mimeType, content };
  }
}
