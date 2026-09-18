import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { CreateBarrierDto } from './dto/create-barrier.dto';
import { UpdateBarrierDto, ResolveBarrierDto } from './dto/update-barrier.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('patient-navigation')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('navigation')
export class NavigationController {
  constructor(private navigationService: NavigationService) {}

  @Post('barriers')
  @ApiOperation({ summary: 'Record a patient navigation barrier' })
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'CARE_COORDINATOR', 'NURSE', 'DOCTOR')
  async createBarrier(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateBarrierDto,
  ) {
    return this.navigationService.createBarrier(tenantId, dto);
  }

  @Patch('barriers/:id')
  @ApiOperation({ summary: 'Update barrier intervention or status' })
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'CARE_COORDINATOR', 'NURSE', 'DOCTOR')
  async updateBarrier(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBarrierDto,
  ) {
    return this.navigationService.updateBarrier(tenantId, id, dto);
  }

  @Patch('barriers/:id/resolve')
  @ApiOperation({ summary: 'Resolve a patient barrier' })
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'CARE_COORDINATOR', 'NURSE', 'DOCTOR')
  async resolveBarrier(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ResolveBarrierDto,
  ) {
    return this.navigationService.resolveBarrier(tenantId, id, dto);
  }

  @Get('barriers/patient/:patientId')
  @ApiOperation({ summary: 'Get all barriers for a patient' })
  async getPatientBarriers(
    @CurrentTenant() tenantId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.navigationService.getPatientBarriers(tenantId, patientId);
  }

  @Get('analytics/barriers')
  @ApiOperation({ summary: 'Get barrier distribution and resolution rate' })
  async getBarrierAnalytics(@CurrentTenant() tenantId: string) {
    return this.navigationService.getBarrierAnalytics(tenantId);
  }

  @Get('analytics/bottlenecks')
  @ApiOperation({ summary: 'Get hospital-side vs patient-side operational bottlenecks' })
  async getOperationalBottlenecks(@CurrentTenant() tenantId: string) {
    return this.navigationService.getOperationalBottlenecks(tenantId);
  }
}
