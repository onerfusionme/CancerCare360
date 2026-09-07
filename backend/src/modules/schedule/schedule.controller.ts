import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Create schedule' })
  create(
    @CurrentTenant() tenantId: string,
    @Body() createScheduleDto: CreateScheduleDto,
  ) {
    return this.scheduleService.create(tenantId, createScheduleDto);
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get schedules by doctor' })
  findByDoctor(
    @CurrentTenant() tenantId: string,
    @Param('doctorId') doctorId: string,
  ) {
    return this.scheduleService.findByDoctor(tenantId, doctorId);
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get schedules by department' })
  findByDepartment(
    @CurrentTenant() tenantId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.scheduleService.findByDepartment(tenantId, departmentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update schedule' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(tenantId, id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate schedule' })
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.scheduleService.deactivate(tenantId, id);
  }
}
