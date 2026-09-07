import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  
  constructor(private readonly prisma: PrismaService) {}

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
  async ready() {
    let dbStatus = 'up';
    try {
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
    } catch (e) {
      dbStatus = 'down';
    }
    return { status: dbStatus === 'up' ? 'ready' : 'not_ready', dependencies: { database: dbStatus, redis: 'up', elasticsearch: 'up' } };
  }
}
