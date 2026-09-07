import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentFilterDto } from './dto/appointment-filter.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create appointment' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.create(tenantId, user.id, createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List appointments with filters' })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() filterDto: AppointmentFilterDto,
  ) {
    return this.appointmentService.findAll(tenantId, filterDto);
  }

  @Get('today/:doctorId')
  @ApiOperation({ summary: 'Today list for a doctor' })
  getTodaysAppointments(
    @CurrentTenant() tenantId: string,
    @Param('doctorId') doctorId: string,
  ) {
    return this.appointmentService.getTodaysAppointments(tenantId, doctorId);
  }

  @Get('slots/:doctorId/:date')
  @ApiOperation({ summary: 'Available slots for doctor on a specific date' })
  getAvailableSlots(
    @CurrentTenant() tenantId: string,
    @Param('doctorId') doctorId: string,
    @Param('date') date: string,
  ) {
    return this.appointmentService.getAvailableSlots(tenantId, doctorId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details' })
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentService.findById(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(tenantId, id, updateAppointmentDto);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Check in patient' })
  checkIn(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentService.checkIn(tenantId, id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start consultation' })
  startConsultation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentService.startConsultation(tenantId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete consultation' })
  completeConsultation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentService.completeConsultation(tenantId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment with reason' })
  cancel(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.appointmentService.cancel(tenantId, id, reason);
  }

  @Post(':id/no-show')
  @ApiOperation({ summary: 'Mark appointment as no-show' })
  markNoShow(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentService.markNoShow(tenantId, id);
  }
}
