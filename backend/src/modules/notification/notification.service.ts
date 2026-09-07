import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createTemplate(tenantId: string, dto: CreateTemplateDto) {
    return this.prisma.notificationTemplate.create({
      data: {
        ...dto,
        tenantId,
      } as any,
    });
  }

  async getTemplates(tenantId: string, channel?: string, language?: string) {
    const where: any = { tenantId };
    if (channel) where.channel = channel;
    if (language) where.language = language;

    return this.prisma.notificationTemplate.findMany({ where });
  }

  async updateTemplate(tenantId: string, id: string, dto: Partial<CreateTemplateDto>) {
    return this.prisma.notificationTemplate.update({
      where: { id, tenantId } as any,
      data: dto as any,
    });
  }

  private renderTemplate(template: string, variables: Record<string, any>): string {
     let rendered = template;
     for (const [key, value] of Object.entries(variables)) {
        rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
     }
     return rendered;
  }

  async send(tenantId: string, dto: SendNotificationDto) {
    let finalBody = dto.body || '';
    let finalSubject = dto.subject || '';

    if (dto.templateId) {
       const template = await this.prisma.notificationTemplate.findUnique({
          where: { id: dto.templateId, tenantId } as any,
       });
       if (template) {
          finalBody = this.renderTemplate((template as any).bodyTemplate, dto.variables || {});
          if ((template as any).subject) {
             finalSubject = this.renderTemplate((template as any).subject, dto.variables || {});
          }
       }
    }

    // TODO: Integrate SMS/Email provider dispatch
    return this.prisma.notification.create({
       data: {
          tenantId,
          recipientId: dto.recipientId,
          recipientType: dto.recipientType,
          channel: dto.channel,
          templateId: dto.templateId,
          subject: finalSubject,
          body: finalBody,
          status: 'PENDING',
       } as any,
    });
  }

  async sendBulk(tenantId: string, dtos: SendNotificationDto[]) {
     const results = [];
     for (const dto of dtos) {
        results.push(await this.send(tenantId, dto));
     }
     return results;
  }

  async findByRecipient(tenantId: string, recipientId: string) {
     return this.prisma.notification.findMany({
        where: { tenantId, recipientId } as any,
        orderBy: { createdAt: 'desc' },
     });
  }

  async getDeliveryStats(tenantId: string, dateFrom?: string, dateTo?: string) {
     const where: any = { tenantId };
     if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
     }

     const [total, sent, delivered, failed] = await Promise.all([
        this.prisma.notification.count({ where }),
        this.prisma.notification.count({ where: { ...where, status: 'SENT' } }),
        this.prisma.notification.count({ where: { ...where, status: 'DELIVERED' } }),
        this.prisma.notification.count({ where: { ...where, status: 'FAILED' } }),
     ]);

     return { total, sent, delivered, failed };
  }

  async markDelivered(tenantId: string, id: string) {
     return this.prisma.notification.update({
        where: { id, tenantId } as any,
        data: { status: 'DELIVERED', deliveredAt: new Date() } as any,
     });
  }

  async markFailed(tenantId: string, id: string, errorMessage: string) {
     return this.prisma.notification.update({
        where: { id, tenantId } as any,
        data: {
           status: 'FAILED',
           failedAt: new Date(),
           errorMessage,
           retryCount: { increment: 1 },
        } as any,
     });
  }
}
