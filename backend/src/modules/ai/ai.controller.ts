import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { ExtractDocumentDto } from './dto/extract-document.dto';
import { SummarizeConsultationDto } from './dto/summarize-consultation.dto';
import { ExplainGapDto } from './dto/explain-gap.dto';
import { DraftEducationDto } from './dto/draft-education.dto';
import { ReviewInteractionDto } from './dto/review-interaction.dto';
import { AiLogFilterDto } from './dto/ai-log-filter.dto';

@ApiTags('ai')
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract-document')
  @ApiOperation({ summary: 'Extract structured clinical data from a document' })
  async extractDocument(@Req() req: any, @Body() dto: ExtractDocumentDto) {
    return this.aiService.extractDocument(req.tenantId, req.user?.id || req.user, dto);
  }

  @Post('extract')
  @ApiOperation({ summary: 'Extract structured clinical data from a document (alias)' })
  async extractDocumentAlias(@Req() req: any, @Body() dto: ExtractDocumentDto) {
    return this.aiService.extractDocument(req.tenantId, req.user?.id || req.user, dto);
  }

  @Post('summarize-consultation')
  @ApiOperation({ summary: 'Generate pre-consultation summary' })
  async summarizeConsultation(@Req() req: any, @Body() dto: SummarizeConsultationDto) {
    return this.aiService.summarizeConsultation(req.tenantId, req.user?.id || req.user, dto);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Generate pre-consultation summary (alias)' })
  async summarizeConsultationAlias(@Req() req: any, @Body() dto: SummarizeConsultationDto) {
    return this.aiService.summarizeConsultation(req.tenantId, req.user?.id || req.user, dto);
  }

  @Post('explain-gap')
  @ApiOperation({ summary: 'Explain a care gap in plain language' })
  async explainCareGap(@Req() req: any, @Body() dto: ExplainGapDto) {
    return this.aiService.explainCareGap(req.tenantId, req.user?.id || req.user, dto);
  }

  @Post('draft-education')
  @ApiOperation({ summary: 'Draft patient education material' })
  async draftEducation(@Req() req: any, @Body() dto: DraftEducationDto) {
    return this.aiService.draftEducation(req.tenantId, req.user?.id || req.user, dto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get AI interaction logs' })
  async getLogs(@Req() req: any, @Query() filterDto: AiLogFilterDto) {
    return this.aiService.getLogs(req.tenantId, filterDto);
  }

  @Get('governance/stats')
  @ApiOperation({ summary: 'Get AI governance and performance statistics' })
  async getGovernanceStats(@Req() req: any) {
    return this.aiService.getGovernanceStats(req.tenantId);
  }

  @Get('governance-stats')
  @ApiOperation({ summary: 'Get AI governance and performance statistics (alias)' })
  async getGovernanceStatsAlias(@Req() req: any) {
    return this.aiService.getGovernanceStats(req.tenantId);
  }

  @Patch('logs/:id/review')
  @ApiOperation({ summary: 'Review and provide feedback on AI interaction' })
  async reviewInteraction(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewInteractionDto,
  ) {
    return this.aiService.reviewInteraction(req.tenantId, id, req.user?.id || req.user, dto);
  }

  @Post('logs/:id/review')
  @ApiOperation({ summary: 'Review and provide feedback on AI interaction (POST alias)' })
  async reviewInteractionPost(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewInteractionDto,
  ) {
    return this.aiService.reviewInteraction(req.tenantId, id, req.user?.id || req.user, dto);
  }
}
