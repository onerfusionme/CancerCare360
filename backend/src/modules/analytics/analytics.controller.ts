import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiQuery({ name: 'role', required: true, type: String })
  async getDashboard(@Request() req: any, @Query('role') role: string) {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    return this.analyticsService.getRoleDashboard(tenantId, role, userId);
  }

  @Get('continuity')
  async getContinuity(@Request() req: any) {
    const tenantId = req.tenantId;
    return this.analyticsService.getCareContinuity(tenantId);
  }

  @Get('investigation-tat')
  async getInvestigationTAT(@Request() req: any) {
    const tenantId = req.tenantId;
    return this.analyticsService.getInvestigationTAT(tenantId);
  }

  @Get('practice-growth')
  async getPracticeGrowthMetrics(@Request() req: any) {
    const tenantId = req.tenantId;
    return this.analyticsService.getPracticeGrowthMetrics(tenantId);
  }

  @Get('service-utilization')
  async getServiceUtilization(@Request() req: any) {
    const tenantId = req.tenantId;
    return this.analyticsService.getServiceUtilization(tenantId);
  }
}
