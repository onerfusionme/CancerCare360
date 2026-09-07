import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
@Roles('platform_admin') // Only platform admins can manage tenants
@UseInterceptors(AuditInterceptor)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant (platform_admin only)' })
  @ApiResponse({ status: 201, description: 'Tenant created' })
  async create(@Body() createTenantDto: CreateTenantDto): Promise<ApiResponseDto<any>> {
    const data = await this.tenantService.create(createTenantDto);
    return { success: true, data, message: 'Tenant created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants' })
  @ApiResponse({ status: 200, description: 'List of tenants' })
  async findAll(@Query() query: PaginationQueryDto): Promise<ApiResponseDto<any>> {
    const data = await this.tenantService.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant details' })
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const data = await this.tenantService.findById(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated' })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.tenantService.update(id, updateTenantDto);
    return { success: true, data, message: 'Tenant updated successfully' };
  }
}
