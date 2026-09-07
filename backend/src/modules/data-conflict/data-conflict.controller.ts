import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DataConflictService } from './data-conflict.service';
import { CreateConflictDto } from './dto/create-conflict.dto';
import { ResolveConflictDto } from './dto/resolve-conflict.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('data-conflicts')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard, RbacGuard)
@Controller('data-conflicts')
export class DataConflictController {
  constructor(private readonly dataConflictService: DataConflictService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new data conflict' })
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateConflictDto) {
    return this.dataConflictService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List unresolved data conflicts' })
  @ApiQuery({ name: 'patientId', required: false })
  findAll(@CurrentTenant() tenantId: string, @Query('patientId') patientId?: string) {
    return this.dataConflictService.findAll(tenantId, patientId);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve a data conflict' })
  resolve(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ResolveConflictDto
  ) {
    return this.dataConflictService.resolve(tenantId, id, userId, dto.resolution);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all conflicts for a patient' })
  findByPatient(@CurrentTenant() tenantId: string, @Param('patientId') patientId: string) {
    return this.dataConflictService.findByPatient(tenantId, patientId);
  }
}
