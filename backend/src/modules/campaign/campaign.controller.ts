import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create new campaign' })
  create(@Request() req: any, @Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(req.user.tenantId, createCampaignDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  findAll(@Request() req: any, @Query() filter: CampaignFilterDto) {
    return this.campaignService.findAll(req.user.tenantId, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by id' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign' })
  update(@Request() req: any, @Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return this.campaignService.update(req.user.tenantId, id, updateCampaignDto);
  }

  @Post(':id/request-approval')
  @ApiOperation({ summary: 'Request campaign approval' })
  requestApproval(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.requestApproval(req.user.tenantId, id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve campaign' })
  approve(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.approve(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject campaign' })
  reject(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.reject(req.user.tenantId, id);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute campaign' })
  executeCampaign(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.executeCampaign(req.user.tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get campaign stats' })
  getStats(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.getStats(req.user.tenantId, id);
  }
}
