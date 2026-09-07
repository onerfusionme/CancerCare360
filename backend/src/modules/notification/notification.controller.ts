import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notification-templates')
  @ApiOperation({ summary: 'Create template' })
  createTemplate(
    @CurrentTenant() tenantId: string,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return this.notificationService.createTemplate(tenantId, createTemplateDto);
  }

  @Get('notification-templates')
  @ApiOperation({ summary: 'List templates' })
  getTemplates(
    @CurrentTenant() tenantId: string,
    @Query('channel') channel?: string,
    @Query('language') language?: string,
  ) {
    return this.notificationService.getTemplates(tenantId, channel, language);
  }

  @Patch('notification-templates/:id')
  @ApiOperation({ summary: 'Update template' })
  updateTemplate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateTemplateDto>,
  ) {
    return this.notificationService.updateTemplate(tenantId, id, updateDto);
  }

  @Post('notifications/send')
  @ApiOperation({ summary: 'Send notification' })
  send(
    @CurrentTenant() tenantId: string,
    @Body() dto: SendNotificationDto,
  ) {
    return this.notificationService.send(tenantId, dto);
  }

  @Post('notifications/send-bulk')
  @ApiOperation({ summary: 'Send bulk notifications' })
  sendBulk(
    @CurrentTenant() tenantId: string,
    @Body() dtos: SendNotificationDto[],
  ) {
    return this.notificationService.sendBulk(tenantId, dtos);
  }

  @Get('notifications/recipient/:recipientId')
  @ApiOperation({ summary: 'Recipient history' })
  findByRecipient(
    @CurrentTenant() tenantId: string,
    @Param('recipientId') recipientId: string,
  ) {
    return this.notificationService.findByRecipient(tenantId, recipientId);
  }

  @Get('notifications/stats')
  @ApiOperation({ summary: 'Delivery stats' })
  getStats(
    @CurrentTenant() tenantId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.notificationService.getDeliveryStats(tenantId, dateFrom, dateTo);
  }
}
