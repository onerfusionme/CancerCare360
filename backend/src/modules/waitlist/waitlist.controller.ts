import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('waitlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @ApiOperation({ summary: 'Create waitlist entry' })
  create(
    @CurrentTenant() tenantId: string,
    @Body() createWaitlistDto: CreateWaitlistDto,
  ) {
    return this.waitlistService.create(tenantId, createWaitlistDto);
  }

  @Get()
  @ApiOperation({ summary: 'List waitlist entries' })
  @ApiQuery({ name: 'departmentId', required: false })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.waitlistService.findAll(tenantId, departmentId);
  }

  @Post(':id/fulfill')
  @ApiOperation({ summary: 'Fulfill waitlist entry' })
  fulfill(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.waitlistService.fulfill(tenantId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel waitlist entry' })
  cancel(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.waitlistService.cancel(tenantId, id);
  }
}
