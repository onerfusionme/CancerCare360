import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { UserStatus } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('jwt'), TenantGuard, RbacGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: false, description: 'Tenant ID' })
@UseInterceptors(AuditInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current logged in user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getMe(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.userService.findById(tenantId, user.id);
    return { success: true, data };
  }

  @Post()
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Create a new staff user and dispatch credentials email' })
  @ApiResponse({ status: 201, description: 'User created and email dispatched' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.userService.create(tenantId, createUserDto);
    return {
      success: true,
      data,
      message: 'Staff user created and credentials invitation dispatched',
    };
  }

  @Get()
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'List all staff users in tenant' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: PaginationQueryDto & { departmentId?: string; roleId?: string; search?: string },
  ): Promise<ApiResponseDto<any>> {
    const data = await this.userService.findAll(tenantId, query);
    return { success: true, data };
  }

  @Get(':id')
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.userService.findById(tenantId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.userService.update(tenantId, id, updateUserDto);
    return { success: true, data, message: 'User updated successfully' };
  }

  @Post(':id/resend-credentials')
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Resend login credentials email to staff user' })
  async resendCredentials(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.userService.resendCredentials(tenantId, id);
    return { success: true, data, message: data.message };
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SYSTEM_ADMIN', 'platform_admin', 'hospital_admin')
  @ApiOperation({ summary: 'Toggle user active/inactive status' })
  async toggleStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.userService.toggleStatus(tenantId, id, status);
    return { success: true, data, message: `User status changed to ${status}` };
  }
}
