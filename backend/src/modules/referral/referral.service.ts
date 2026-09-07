import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReferralDto, ReferralFilterDto } from './dto/referral.dto';

@Injectable()
export class ReferralService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateReferralDto) {
    return this.prisma.referral.create({
      data: {
        tenantId,
        referredByName: dto.referredByName,
        referredByType: dto.referredByType,
        referredByContact: dto.referredByContact,
        referredToId: dto.referredToId,
        departmentId: dto.departmentId,
        patientId: dto.patientId,
        notes: dto.notes,
        referralDate: dto.referralDate || new Date(),
      },
    });
  }

  async findAll(tenantId: string, filter: ReferralFilterDto) {
    const { referredByType, referredToId, dateFrom, dateTo, page = 1, limit = 10 } = filter;
    
    const where: any = { tenantId };
    if (referredByType) where.referredByType = referredByType;
    if (referredToId) where.referredToId = referredToId;
    if (dateFrom || dateTo) {
      where.referralDate = {};
      if (dateFrom) where.referralDate.gte = dateFrom;
      if (dateTo) where.referralDate.lte = dateTo;
    }

    const skip = (page - 1) * limit;
    
    const [total, data] = await Promise.all([
      this.prisma.referral.count({ where }),
      this.prisma.referral.findMany({
        where,
        skip,
        take: limit,
        orderBy: { referralDate: 'desc' },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          referredTo: { select: { id: true, firstName: true, lastName: true } },
        }
      }),
    ]);

    return { total, page, limit, data };
  }

  async findOne(tenantId: string, id: string) {
    const referral = await this.prisma.referral.findFirst({
      where: { id, tenantId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        referredTo: { select: { id: true, firstName: true, lastName: true } },
      }
    });

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    return referral;
  }

  async markConverted(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.referral.update({
      where: { id },
      data: { convertedToJourney: true },
    });
  }

  async getAnalytics(tenantId: string) {
    const totalReferrals = await this.prisma.referral.count({ where: { tenantId } });
    
    const convertedCount = await this.prisma.referral.count({
      where: { tenantId, convertedToJourney: true }
    });
    
    const conversionRate = totalReferrals > 0 ? (convertedCount / totalReferrals) * 100 : 0;

    const sourceGroup = await this.prisma.referral.groupBy({
      by: ['referredByType'],
      where: { tenantId },
      _count: { id: true }
    });
    const bySource = sourceGroup.map(g => ({
      source: g.referredByType,
      count: g._count.id
    }));

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const recentReferrals = await this.prisma.referral.findMany({
      where: { tenantId, referralDate: { gte: twelveMonthsAgo } },
      select: { referralDate: true }
    });
    
    const monthlyData: Record<string, number> = {};
    recentReferrals.forEach(r => {
      const monthYear = `${r.referralDate.getFullYear()}-${String(r.referralDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });
    const byMonth = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));

    const referrerGroup = await this.prisma.referral.groupBy({
      by: ['referredByName'],
      where: { tenantId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    const topReferrers = referrerGroup.map(g => ({
      name: g.referredByName,
      count: g._count.id
    }));

    return {
      totalReferrals,
      conversionRate,
      bySource,
      byMonth,
      topReferrers
    };
  }
}
