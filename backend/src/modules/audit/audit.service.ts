import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditFilterDto } from './dto/audit-filter.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    tenantId?: string | null;
    userId?: string | null;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    previousValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          previousValue: data.previousValue,
          newValue: data.newValue,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // We don't throw here to avoid failing the main request if auditing fails
    }
  }

  async query(tenantId: string, filterDto: AuditFilterDto) {
    const { page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc', userId, resourceType, resourceId, action, dateFrom, dateTo } = filterDto;

    const where: any = { tenantId };
    
    if (userId) where.userId = userId;
    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom);
      if (dateTo) where.timestamp.lte = new Date(dateTo);
    }

    const total = await this.prisma.auditLog.count({ where });
    const data = await this.prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      }
    });

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
}
