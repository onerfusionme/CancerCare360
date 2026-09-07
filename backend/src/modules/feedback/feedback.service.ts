import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFeedbackDto, FeedbackFilterDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateFeedbackDto) {
    return this.prisma.patientFeedback.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,
        doctorId: dto.doctorId,
        overallRating: dto.overallRating,
        npsScore: dto.npsScore,
        waitTimeRating: dto.waitTimeRating,
        careQualityRating: dto.careQualityRating,
        communicationRating: dto.communicationRating,
        comment: dto.comment,
        isAnonymous: dto.isAnonymous ?? false,
      },
    });
  }

  async findAll(tenantId: string, filter: FeedbackFilterDto) {
    const { doctorId, dateFrom, dateTo, page = 1, limit = 10 } = filter;
    
    const where: any = { tenantId };
    if (doctorId) where.doctorId = doctorId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const skip = (page - 1) * limit;
    
    const [total, data] = await Promise.all([
      this.prisma.patientFeedback.count({ where }),
      this.prisma.patientFeedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          doctor: { select: { id: true, firstName: true, lastName: true } },
        }
      }),
    ]);

    // Handle anonymity
    const finalData = data.map(item => {
      if (item.isAnonymous) {
        return {
          ...item,
          patient: null, // Omit patient data if anonymous
        };
      }
      return item;
    });

    return { total, page, limit, data: finalData };
  }

  async findOne(tenantId: string, id: string) {
    const feedback = await this.prisma.patientFeedback.findFirst({
      where: { id, tenantId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
      }
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    if (feedback.isAnonymous) {
      feedback.patient = null as any;
    }

    return feedback;
  }

  async getNpsSummary(tenantId: string) {
    const feedbacks = await this.prisma.patientFeedback.findMany({
      where: { tenantId, npsScore: { not: null } },
      select: { npsScore: true, overallRating: true }
    });

    const totalFeedbacks = feedbacks.length;
    let averageNps = 0;
    let averageOverallRating = 0;
    let promoters = 0;
    let passives = 0;
    let detractors = 0;
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalFeedbacks > 0) {
      const allOverall = await this.prisma.patientFeedback.findMany({
        where: { tenantId },
        select: { overallRating: true }
      });

      allOverall.forEach(f => {
        ratingDistribution[f.overallRating] = (ratingDistribution[f.overallRating] || 0) + 1;
      });

      let npsSum = 0;
      feedbacks.forEach(f => {
        const nps = f.npsScore!;
        npsSum += nps;
        if (nps >= 9) promoters++;
        else if (nps >= 7) passives++;
        else detractors++;
      });

      averageNps = npsSum / totalFeedbacks;
      
      let overallSum = 0;
      allOverall.forEach(f => {
        overallSum += f.overallRating;
      });
      averageOverallRating = allOverall.length > 0 ? overallSum / allOverall.length : 0;
    }

    const npsScore = totalFeedbacks > 0 
      ? ((promoters - detractors) / totalFeedbacks) * 100 
      : 0;

    return {
      averageNps,
      npsClassification: { promoters, passives, detractors },
      npsScore,
      averageOverallRating,
      totalFeedbacks,
      ratingDistribution
    };
  }

  async getDoctorRatings(tenantId: string) {
    const doctorGroups = await this.prisma.patientFeedback.groupBy({
      by: ['doctorId'],
      where: { tenantId, doctorId: { not: null } },
      _avg: {
        overallRating: true,
        waitTimeRating: true,
        careQualityRating: true,
        communicationRating: true,
      },
      _count: {
        id: true,
      }
    });

    const results = [];
    for (const group of doctorGroups) {
      if (!group.doctorId) continue;
      const doctor = await this.prisma.user.findUnique({
        where: { id: group.doctorId },
        select: { id: true, firstName: true, lastName: true }
      });
      if (doctor) {
        results.push({
          doctor,
          averageOverall: group._avg.overallRating,
          averageWaitTime: group._avg.waitTimeRating,
          averageCareQuality: group._avg.careQualityRating,
          averageCommunication: group._avg.communicationRating,
          totalFeedbacks: group._count.id
        });
      }
    }

    return results;
  }
}
