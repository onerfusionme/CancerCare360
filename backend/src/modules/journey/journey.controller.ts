import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JourneyService } from './journey.service';
import { CreateJourneyDto } from './dto/create-journey.dto';
import { UpdateJourneyDto } from './dto/update-journey.dto';
import { JourneyFilterDto } from './dto/journey-filter.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('journeys')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Post()
  @Roles('ONCOLOGIST', 'DEPARTMENT_ADMIN')
  @ApiOperation({ summary: 'Create a new care journey' })
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateJourneyDto) {
    return this.journeyService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List journeys with filters' })
  findAll(@CurrentTenant() tenantId: string, @Query() filterDto: JourneyFilterDto) {
    return this.journeyService.findAll(tenantId, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journey details' })
  findById(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.journeyService.findById(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update journey details' })
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateJourneyDto) {
    return this.journeyService.update(tenantId, id, dto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close a care journey' })
  close(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.journeyService.close(tenantId, id);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get timeline events for a journey' })
  getTimeline(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.journeyService.getTimeline(tenantId, id);
  }
}

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('patients')
export class PatientTimelineController {
  constructor(private readonly journeyService: JourneyService) {}

  @Get(':patientId/timeline')
  @ApiOperation({ summary: "Get patient's full timeline across all journeys" })
  getPatientTimeline(@CurrentTenant() tenantId: string, @Param('patientId') patientId: string) {
    return this.journeyService.getPatientTimeline(tenantId, patientId);
  }
}
