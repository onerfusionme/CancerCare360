import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ConsultationService } from './consultation.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('consultation-readiness')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('consultation-readiness')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Get(':patientId')
  @ApiOperation({ summary: 'Get full consultation readiness summary' })
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
}
