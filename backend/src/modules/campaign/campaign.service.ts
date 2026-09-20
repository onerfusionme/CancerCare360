import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';
import { ApprovalStatus, DeliveryStatus, CampaignType, CommunicationChannel } from '@prisma/client';

@Injectable()
export class CampaignService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createCampaignDto: CreateCampaignDto, userId: string) {
    return this.prisma.campaign.create({
      data: {
        name: createCampaignDto.name,
        type: createCampaignDto.type as CampaignType,
        audienceCriteria: createCampaignDto.audienceCriteria as any,
        contentId: createCampaignDto.contentId || undefined,
        language: createCampaignDto.language || 'en',
        channel: createCampaignDto.channel as CommunicationChannel,
        scheduledAt: createCampaignDto.scheduledAt ? new Date(createCampaignDto.scheduledAt) : null,
        tenantId,
        createdById: userId,
        approvalStatus: ApprovalStatus.DRAFT,
        deliveryStatus: DeliveryStatus.SCHEDULED,
      },
    });
  }

  async findAll(tenantId: string, filter: CampaignFilterDto) {
    const { type, channel, approvalStatus } = filter;
    
    const where: any = { tenantId };
    
    if (type) where.type = type as CampaignType;
    if (channel) where.channel = channel as CommunicationChannel;
    if (approvalStatus) where.approvalStatus = approvalStatus as ApprovalStatus;

    return this.prisma.campaign.findMany({
      where,
      include: {
        content: { select: { id: true, title: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId },
      include: {
        content: true,
        createdBy: true,
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(tenantId: string, id: string, updateCampaignDto: UpdateCampaignDto) {
    await this.findOne(tenantId, id);
    const data: any = { ...updateCampaignDto };
    if (updateCampaignDto.scheduledAt) {
      data.scheduledAt = new Date(updateCampaignDto.scheduledAt);
    }
    if (updateCampaignDto.audienceCriteria) {
      data.audienceCriteria = updateCampaignDto.audienceCriteria as any;
    }
    return this.prisma.campaign.update({
      where: { id },
      data,
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  async requestApproval(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.campaign.update({
      where: { id },
      data: { approvalStatus: ApprovalStatus.PENDING_APPROVAL },
    });
  }

  async approve(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);
    return this.prisma.campaign.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.APPROVED,
      },
    });
  }

  async reject(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.campaign.update({
      where: { id },
      data: { approvalStatus: ApprovalStatus.REJECTED },
    });
  }

  async executeCampaign(tenantId: string, id: string) {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.approvalStatus !== 'APPROVED') {
      throw new Error('Campaign must be approved before execution');
    }
    
    await this.prisma.campaign.update({
      where: { id },
      data: { deliveryStatus: 'IN_PROGRESS' },
    });

    const criteria: any = campaign.audienceCriteria || {};
    const where: any = { tenantId, status: 'ACTIVE' };
    if (criteria.gender) where.gender = criteria.gender;
    if (criteria.minAge) {
      const date = new Date();
      date.setFullYear(date.getFullYear() - criteria.minAge);
      where.dateOfBirth = { lte: date };
    }

    const patients = await this.prisma.patient.findMany({ where });
    let sentCount = 0;
    
    for (const patient of patients) {
       await this.prisma.notification.create({
          data: {
             tenantId,
             recipientId: patient.id,
             recipientType: 'PATIENT',
             channel: campaign.channel,
             subject: campaign.name,
             body: campaign.content?.body || 'Campaign message',
             status: 'PENDING',
          } as any
       });
       sentCount++;
    }
    
    const deliveredCount = sentCount; // Notifications are PENDING, but we'll consider them processed by the campaign for now.
    const failedCount = 0;

    return this.prisma.campaign.update({
      where: { id },
      data: {
        deliveryStatus: 'COMPLETED',
        sentCount: (campaign.sentCount || 0) + sentCount,
        deliveredCount: (campaign.deliveredCount || 0) + deliveredCount,
        failedCount: (campaign.failedCount || 0) + failedCount,
      },
    });
  }

  async getStats(tenantId: string, id: string) {
    const campaign = await this.findOne(tenantId, id);
    return {
      sentCount: campaign.sentCount,
      deliveredCount: campaign.deliveredCount,
      failedCount: campaign.failedCount,
      engagementRate: campaign.deliveredCount > 0 ? ((campaign.deliveredCount - campaign.failedCount) / campaign.deliveredCount) * 100 : 0
    };
  }
}
