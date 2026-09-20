import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Roles & Permissions')
@Controller('roles')
@UseGuards(AuthGuard('jwt'), TenantGuard, RbacGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: false, description: 'Tenant ID' })
@UseInterceptors(AuditInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('permissions')
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Get catalog of system resources and permissions' })
  async getPermissionsCatalog(): Promise<ApiResponseDto<any>> {
    const data = await this.roleService.getAvailablePermissionsCatalog();
    return { success: true, data };
  }

  @Get()
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'List all roles in tenant' })
  async findAll(@CurrentTenant() tenantId: string): Promise<ApiResponseDto<any>> {
    const data = await this.roleService.findAll(tenantId);
    return { success: true, data };
  }

  @Get(':id')
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Get role details and permissions' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.roleService.findById(tenantId, id);
    return { success: true, data };
  }

  @Post()
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Create a new custom role with permissions' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateRoleDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.roleService.create(tenantId, dto);
    return { success: true, data, message: `Role ${dto.name} created successfully` };
  }

  @Patch(':id')
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Update role and permissions' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.roleService.update(tenantId, id, dto);
    return { success: true, data, message: 'Role updated successfully' };
  }

  @Delete(':id')
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Delete custom role' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.roleService.delete(tenantId, id);
    return { success: true, data: result, message: result.message };
  }
}
