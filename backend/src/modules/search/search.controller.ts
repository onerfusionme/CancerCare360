import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Global Search')
@Controller('search')
@UseGuards(AuthGuard('jwt'), TenantGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: false })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, description: 'Type to search (e.g. patients, appointments)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @CurrentTenant() tenantId: string,
    @Query('q') query: string,
    @Query('type') type?: string,
  ): Promise<ApiResponseDto<any>> {
    // For Phase 1, we are only searching patients via Elastic
    let results: any = {};
    
    if (!type || type === 'patients') {
       results.patients = await this.searchService.searchPatients(tenantId, query);
    }

    return { success: true, data: results };
  }
}
