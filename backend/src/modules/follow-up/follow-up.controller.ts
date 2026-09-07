import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FollowUpService } from './follow-up.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('follow-up-tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('follow-up-tasks')
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Post()
  @ApiOperation({ summary: 'Create follow-up task' })
  create(
    @CurrentTenant() tenantId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.followUpService.create(tenantId, createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with filters' })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() filterDto: TaskFilterDto,
  ) {
    return this.followUpService.findAll(tenantId, filterDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Current user tasks' })
  getMyTasks(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.followUpService.getMyTasks(tenantId, user.id);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'All overdue tasks' })
  getOverdueTasks(@CurrentTenant() tenantId: string) {
    return this.followUpService.getOverdueTasks(tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard stats' })
  getDashboardStats(
    @CurrentTenant() tenantId: string,
    @Query('userId') userId?: string,
  ) {
    return this.followUpService.getDashboardStats(tenantId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task detail' })
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.followUpService.findById(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.followUpService.update(tenantId, id, user.id, updateTaskDto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign task' })
  assign(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.followUpService.assign(tenantId, id, userId);
  }

  @Post(':id/escalate')
  @ApiOperation({ summary: 'Escalate task' })
  escalate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.followUpService.escalate(tenantId, id);
  }
}
