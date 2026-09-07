import { Controller, Post, Body, Request, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Response } from 'express';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  async generate(@Request() req: any, @Body() dto: GenerateReportDto, @Res() res: Response) {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const report = await this.reportsService.generateReport(tenantId, userId, dto);
    
    res.setHeader('Content-Type', report.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=${report.fileName}`);
    res.send(report.content);
  }
}
