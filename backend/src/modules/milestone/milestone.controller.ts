import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MilestoneService } from './milestone.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('milestones')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('milestones')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new milestone' })
  createMilestone(@CurrentTenant() tenantId: string, @Body() dto: CreateMilestoneDto) {
    return this.milestoneService.createMilestone(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List milestones by journey' })
  @ApiQuery({ name: 'journeyId', required: true })
  getMilestonesByJourney(@CurrentTenant() tenantId: string, @Query('journeyId') journeyId: string) {
    return this.milestoneService.getMilestonesByJourney(tenantId, journeyId);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'List overdue milestones across all patients' })
  getOverdueMilestones(@CurrentTenant() tenantId: string) {
    return this.milestoneService.getOverdueMilestones(tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update milestone' })
  updateMilestone(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateMilestoneDto) {
    return this.milestoneService.updateMilestone(tenantId, id, dto);
  }

  // Template Endpoints
  @Post('../milestone-templates')
  @Roles('SYSTEM_ADMIN', 'DEPARTMENT_ADMIN')
  @ApiOperation({ summary: 'Create a new milestone template' })
  createTemplate(@CurrentTenant() tenantId: string, @Body() dto: CreateTemplateDto) {
    return this.milestoneService.createTemplate(tenantId, dto);
  }

  @Get('../milestone-templates')
  @ApiOperation({ summary: 'List milestone templates' })
  @ApiQuery({ name: 'diagnosisCategory', required: false })
  getTemplates(@CurrentTenant() tenantId: string, @Query('diagnosisCategory') diagnosisCategory?: string) {
    return this.milestoneService.getTemplates(tenantId, diagnosisCategory);
  }

  @Patch('../milestone-templates/:id')
  @Roles('SYSTEM_ADMIN', 'DEPARTMENT_ADMIN')
  @ApiOperation({ summary: 'Update milestone template' })
  updateTemplate(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) {
    return this.milestoneService.updateTemplate(tenantId, id, dto);
  }
}
