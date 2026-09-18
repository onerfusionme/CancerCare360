import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvestigationService } from './investigation.service';
import { CreateInvestigationDto } from './dto/create-investigation.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { InvestigationFilterDto } from './dto/investigation-filter.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('investigations')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('investigations')
export class InvestigationController {
  constructor(private readonly investigationService: InvestigationService) {}

  @Post()
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'ONCOLOGIST', 'NURSE', 'DOCTOR')
  @ApiOperation({ summary: 'Create a new investigation order' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvestigationDto,
  ) {
    return this.investigationService.create(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List investigations with SLA tracking and filters' })
  findAll(@CurrentTenant() tenantId: string, @Query() filterDto: InvestigationFilterDto) {
    return this.investigationService.findAll(tenantId, filterDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get diagnostic TAT metrics, SLA breach counts and compliance rates' })
  getSummary(@CurrentTenant() tenantId: string) {
    return this.investigationService.getSummary(tenantId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending investigations' })
  getPending(@CurrentTenant() tenantId: string) {
    return this.investigationService.getPending(tenantId);
  }

  @Get('stats/turnaround')
  @ApiOperation({ summary: 'Get turnaround time statistics by modality' })
  getTurnaroundStats(@CurrentTenant() tenantId: string) {
    return this.investigationService.getTurnaroundStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get investigation details' })
  findById(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.investigationService.findById(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update investigation status, sample collection, report, or review' })
  updateStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvestigationDto,
  ) {
    return this.investigationService.updateStatus(tenantId, id, userId, dto);
  }
}
