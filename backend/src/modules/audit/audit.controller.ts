import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditFilterDto } from './dto/audit-filter.dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'), TenantGuard, RbacGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: false })
@Roles('hospital_admin', 'auditor', 'platform_admin')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Query audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async query(
    @CurrentTenant() tenantId: string,
    @Query() filterDto: AuditFilterDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.auditService.query(tenantId, filterDto);
    return { success: true, data };
  }
}
