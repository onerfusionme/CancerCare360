import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ConsultationService, FinalizeConsultationDto, StatInvestigationDto } from './consultation.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('consultation-readiness')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('consultation-readiness')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Get(':patientId')
  @ApiOperation({ summary: 'Get full consultation readiness summary with 0-100 score' })
  @ApiQuery({ name: 'journeyId', required: false })
  getReadiness(
    @CurrentTenant() tenantId: string,
    @Param('patientId') patientId: string,
    @Query('journeyId') journeyId?: string,
  ) {
    return this.consultationService.getReadiness(tenantId, patientId, journeyId);
  }

  @Get(':patientId/since-last-visit')
  @ApiOperation({ summary: 'Get changes since last visit' })
  @ApiQuery({ name: 'journeyId', required: false })
  async getSinceLastVisit(
    @CurrentTenant() tenantId: string,
    @Param('patientId') patientId: string,
    @Query('journeyId') journeyId?: string,
  ) {
    const readiness = await this.consultationService.getReadiness(tenantId, patientId, journeyId);
    return readiness.sinceLastVisit;
  }

  @Post(':patientId/stat-investigation')
  @ApiOperation({ summary: 'Order urgent pre-consultation investigation' })
  orderStatInvestigation(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') doctorId: string,
    @Param('patientId') patientId: string,
    @Body() dto: StatInvestigationDto,
  ) {
    return this.consultationService.orderStatInvestigation(
      tenantId,
      patientId,
      doctorId || 'd2e9fa9a-d9ce-4952-96cf-d34e8eabf1c7',
      dto,
    );
  }

  @Post(':patientId/finalize')
  @ApiOperation({ summary: 'Finalize consultation note, RECIST response, and treatment plan' })
  finalizeConsultation(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') doctorId: string,
    @Param('patientId') patientId: string,
    @Body() dto: FinalizeConsultationDto,
  ) {
    return this.consultationService.finalizeConsultation(
      tenantId,
      patientId,
      doctorId || 'd2e9fa9a-d9ce-4952-96cf-d34e8eabf1c7',
      dto,
    );
  }
}
