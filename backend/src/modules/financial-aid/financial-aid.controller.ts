import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { FinancialAidService } from './financial-aid.service';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { CreateAidApplicationDto } from './dto/create-application.dto';
import { UpdateAidApplicationStatusDto } from './dto/update-application.dto';
import { CreateDonorPledgeDto } from './dto/donor-pledge.dto';
import { AidOrgCategory } from '@prisma/client';

@ApiTags('CareRelief - Financial Aid & Grants')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('relief')
export class FinancialAidController {
  constructor(private readonly reliefService: FinancialAidService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary metrics of schemes, active applications, and sanctioned funds' })
  getSummary(@Request() req: any) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.getSummaryMetrics(tenantId);
  }

  @Get('schemes')
  @ApiOperation({ summary: 'List verified government schemes, temple trusts, and charitable funds' })
  getSchemes(
    @Request() req: any,
    @Query('category') category?: AidOrgCategory,
    @Query('search') search?: string,
  ) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.getSchemes(tenantId, category, search);
  }

  @Get('schemes/:id')
  @ApiOperation({ summary: 'Get detailed application procedure, required documents, and submission office for a scheme' })
  getSchemeById(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.getSchemeById(tenantId, id);
  }

  @Post('estimates')
  @ApiOperation({ summary: 'Generate a standardized Hospital Treatment Cost & Deficit Estimate Certificate' })
  createEstimate(@Request() req: any, @Body() dto: CreateEstimateDto) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.createTreatmentEstimate(tenantId, dto);
  }

  @Get('estimates')
  @ApiOperation({ summary: 'List generated treatment cost estimates' })
  getEstimates(@Request() req: any, @Query('patientId') patientId?: string) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.getEstimates(tenantId, patientId);
  }

  @Get('estimates/:id')
  @ApiOperation({ summary: 'Get treatment cost estimate dossier details' })
  getEstimateById(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.getEstimateById(tenantId, id);
  }

  @Post('applications')
  @ApiOperation({ summary: 'Submit an aid application to a specific scheme or trust' })
  createApplication(@Request() req: any, @Body() dto: CreateAidApplicationDto) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.createAidApplication(tenantId, dto);
  }

  @Get('applications')
  @ApiOperation({ summary: 'List aid applications with live status' })
  getApplications(@Request() req: any, @Query('patientId') patientId?: string) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.getApplications(tenantId, patientId);
  }

  @Patch('applications/:id/status')
  @ApiOperation({ summary: 'Update application workflow status, sanctioned amount, or sanction letter number' })
  updateApplicationStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAidApplicationStatusDto,
  ) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.updateApplicationStatus(tenantId, id, dto);
  }

  @Get('donors')
  @ApiOperation({ summary: 'List onboarded philanthropists, business leaders, and CSR funds' })
  getDonors(@Request() req: any) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.getDonors(tenantId);
  }

  @Post('donors/pledge')
  @ApiOperation({ summary: 'Pledge donor sponsorship for a patient treatment deficit' })
  createPledge(@Request() req: any, @Body() dto: CreateDonorPledgeDto) {
    const tenantId = req.tenantId || req.user.tenantId;
    return this.reliefService.createDonorPledge(tenantId, dto);
  }
}
