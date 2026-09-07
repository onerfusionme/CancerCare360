import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CareGapService } from './care-gap.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('care-gaps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller()
export class CareGapController {
  constructor(private readonly careGapService: CareGapService) {}

  @Post('care-gap-rules')
  @ApiOperation({ summary: 'Create care gap rule' })
  createRule(
    @CurrentTenant() tenantId: string,
    @Body() createRuleDto: CreateRuleDto,
  ) {
    return this.careGapService.createRule(tenantId, createRuleDto);
  }

  @Get('care-gap-rules')
  @ApiOperation({ summary: 'List care gap rules' })
  getRules(@CurrentTenant() tenantId: string) {
    return this.careGapService.getRules(tenantId);
  }

  @Patch('care-gap-rules/:id')
  @ApiOperation({ summary: 'Update rule' })
  updateRule(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateRuleDto>,
  ) {
    return this.careGapService.updateRule(tenantId, id, updateDto);
  }

  @Post('care-gap-rules/:id/toggle')
  @ApiOperation({ summary: 'Toggle rule' })
  toggleRule(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.careGapService.toggleRule(tenantId, id);
  }

  @Get('care-gaps/detect')
  @ApiOperation({ summary: 'Run detection and return gaps' })
  detectGaps(@CurrentTenant() tenantId: string) {
    return this.careGapService.detectGaps(tenantId);
  }

  @Post('care-gaps/generate-tasks')
  @ApiOperation({ summary: 'Detect gaps and auto-create tasks' })
  async generateTasks(@CurrentTenant() tenantId: string) {
    const gaps = await this.careGapService.detectGaps(tenantId);
    return this.careGapService.autoGenerateTasks(tenantId, gaps);
  }
}
