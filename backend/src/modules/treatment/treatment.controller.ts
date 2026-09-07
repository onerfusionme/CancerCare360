import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TreatmentService } from './treatment.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { TreatmentFilterDto } from './dto/treatment-filter.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('treatments')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('treatments')
export class TreatmentController {
  constructor(private readonly treatmentService: TreatmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new treatment milestone' })
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateTreatmentDto) {
    return this.treatmentService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List treatment milestones with filters' })
  findAll(@CurrentTenant() tenantId: string, @Query() filterDto: TreatmentFilterDto) {
    return this.treatmentService.findAll(tenantId, filterDto);
  }

  @Get('stats/completion')
  @ApiOperation({ summary: 'Get planned vs completed analytics' })
  getPlannedVsCompleted(@CurrentTenant() tenantId: string) {
    return this.treatmentService.getPlannedVsCompleted(tenantId);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get treatments by patient' })
  getByPatient(@CurrentTenant() tenantId: string, @Param('patientId') patientId: string) {
    return this.treatmentService.getByPatient(tenantId, patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get treatment details' })
  findById(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.treatmentService.findById(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update treatment status/details' })
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTreatmentDto) {
    return this.treatmentService.update(tenantId, id, dto);
  }
}
