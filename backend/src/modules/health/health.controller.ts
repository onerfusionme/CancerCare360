import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  
  @Get()
  @ApiOperation({ summary: 'Basic liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  @HttpCode(HttpStatus.OK)
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @HttpCode(HttpStatus.OK)
  ready() {
    // In a real app, this would check DB, Redis, and Elasticsearch connectivity
    return { status: 'ready', dependencies: { database: 'up', redis: 'up', elasticsearch: 'up' } };
  }
}
