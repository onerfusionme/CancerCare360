import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralService } from './referral.service';
import { CreateReferralDto, ReferralFilterDto } from './dto/referral.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('referrals')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller({ path: 'referrals', version: '1' })
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post()
  create(@Request() req: any, @Body() createReferralDto: CreateReferralDto) {
    return this.referralService.create(req.tenantId, createReferralDto);
  }

  @Get()
  findAll(@Request() req: any, @Query() filter: ReferralFilterDto) {
    return this.referralService.findAll(req.tenantId, filter);
  }

  @Get('analytics')
  getAnalytics(@Request() req: any) {
    return this.referralService.getAnalytics(req.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.referralService.findOne(req.tenantId, id);
  }

  @Patch(':id/convert')
  markConverted(@Request() req: any, @Param('id') id: string) {
    return this.referralService.markConverted(req.tenantId, id);
  }
}
