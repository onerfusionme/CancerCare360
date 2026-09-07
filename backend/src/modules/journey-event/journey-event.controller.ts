import { Controller, Post, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JourneyEventService } from './journey-event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('journey-events')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('journey-events')
export class JourneyEventController {
  constructor(private readonly journeyEventService: JourneyEventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new journey event' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEventDto
  ) {
    return this.journeyEventService.create(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List journey events with filters' })
  findAll(@CurrentTenant() tenantId: string, @Query() filterDto: EventFilterDto) {
    return this.journeyEventService.findAll(tenantId, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journey event details' })
  findById(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.journeyEventService.findById(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update journey event details' })
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto
  ) {
    return this.journeyEventService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/Delete journey event' })
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.journeyEventService.delete(tenantId, id);
  }
}
