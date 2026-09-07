import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OutreachService } from './outreach.service';
import { CreateOutreachDto } from './dto/create-outreach.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('outreach')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('outreach')
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Post()
  @ApiOperation({ summary: 'Log a contact attempt' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() createOutreachDto: CreateOutreachDto,
  ) {
    return this.outreachService.create(tenantId, user.id, createOutreachDto);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'History for a task' })
  findByTask(
    @CurrentTenant() tenantId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.outreachService.findByTask(tenantId, taskId);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'History for a patient' })
  findByPatient(
    @CurrentTenant() tenantId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.outreachService.findByPatient(tenantId, patientId);
  }

  @Get('patient/:patientId/summary')
  @ApiOperation({ summary: 'Contact summary' })
  getContactHistory(
    @CurrentTenant() tenantId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.outreachService.getContactHistory(tenantId, patientId);
  }
}
