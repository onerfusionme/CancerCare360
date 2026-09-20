import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { FinancialAidService } from './financial-aid.service';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { CreateAidApplicationDto } from './dto/create-application.dto';
import { UpdateAidApplicationStatusDto } from './dto/update-application.dto';
import { CreateDonorPledgeDto } from './dto/donor-pledge.dto';
import { CreateSchemeDto, UpdateSchemeDto } from './dto/create-scheme.dto';
import { AidOrgCategory } from '@prisma/client';

@ApiTags('CareRelief - Financial Aid & Grants')
@ApiBearerAuth()
@UseGuards(OptionalAuthGuard)
@Controller('relief')
export class FinancialAidController {
  constructor(private readonly reliefService: FinancialAidService) {}

  private extractTenantId(req: any): string | undefined {
    return req?.user?.tenantId || req?.tenantId;
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get summary metrics of schemes, active applications, and sanctioned funds' })
  getSummary(@Request() req: any) {
    return this.reliefService.getSummaryMetrics(this.extractTenantId(req));
  }

  @Get('schemes')
  @ApiOperation({ summary: 'List verified government schemes, temple trusts, and charitable funds' })
  getSchemes(
    @Request() req: any,
    @Query('category') category?: AidOrgCategory,
    @Query('search') search?: string,
  ) {
    return this.reliefService.getSchemes(this.extractTenantId(req), category, search);
  }

  @Get('schemes/:id')
  @ApiOperation({ summary: 'Get detailed application procedure, required documents, and submission office for a scheme' })
  getSchemeById(@Request() req: any, @Param('id') id: string) {
    return this.reliefService.getSchemeById(this.extractTenantId(req), id);
  }

  @Post('schemes')
  @ApiOperation({ summary: 'Onboard a new temple trust, corporate CSR fund, or charitable scheme' })
  createScheme(@Request() req: any, @Body() dto: CreateSchemeDto) {
    return this.reliefService.createScheme(this.extractTenantId(req), dto);
  }

  @Patch('schemes/:id')
  @ApiOperation({ summary: 'Update an existing scheme or temple trust information' })
  updateScheme(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSchemeDto,
  ) {
    return this.reliefService.updateScheme(this.extractTenantId(req), id, dto);
  }

  @Delete('schemes/:id')
  @ApiOperation({ summary: 'Delete or remove a scheme or trust' })
  deleteScheme(@Request() req: any, @Param('id') id: string) {
    return this.reliefService.deleteScheme(this.extractTenantId(req), id);
  }

  @Post('estimates')
  @ApiOperation({ summary: 'Generate a standardized Hospital Treatment Cost & Deficit Estimate Certificate' })
  createEstimate(@Request() req: any, @Body() dto: CreateEstimateDto) {
    return this.reliefService.createTreatmentEstimate(this.extractTenantId(req), dto);
  }

  @Get('estimates')
  @ApiOperation({ summary: 'List generated treatment cost estimates' })
  getEstimates(@Request() req: any, @Query('patientId') patientId?: string) {
    return this.reliefService.getEstimates(this.extractTenantId(req), patientId);
  }

  @Get('estimates/:id')
  @ApiOperation({ summary: 'Get treatment cost estimate dossier details' })
  getEstimateById(@Request() req: any, @Param('id') id: string) {
    return this.reliefService.getEstimateById(this.extractTenantId(req), id);
  }

  @Post('applications')
  @ApiOperation({ summary: 'Submit an aid application to a specific scheme or trust' })
  createApplication(@Request() req: any, @Body() dto: CreateAidApplicationDto) {
    return this.reliefService.createAidApplication(this.extractTenantId(req), dto);
  }

  @Get('applications')
  @ApiOperation({ summary: 'List aid applications with live status' })
  getApplications(@Request() req: any, @Query('patientId') patientId?: string) {
    return this.reliefService.getApplications(this.extractTenantId(req), patientId);
  }

  @Patch('applications/:id/status')
  @ApiOperation({ summary: 'Update application workflow status, sanctioned amount, or sanction letter number' })
  updateApplicationStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAidApplicationStatusDto,
  ) {
    return this.reliefService.updateApplicationStatus(this.extractTenantId(req), id, dto);
  }

  @Put('applications/:id')
  @ApiOperation({ summary: 'Update application details' })
  updateApplication(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.reliefService.updateApplication(this.extractTenantId(req), id, dto);
  }

  @Delete('applications/:id')
  @ApiOperation({ summary: 'Delete aid application' })
  deleteApplication(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.reliefService.deleteApplication(this.extractTenantId(req), id);
  }

  @Get('donors')
  @ApiOperation({ summary: 'List onboarded philanthropists, business leaders, and CSR funds' })
  getDonors(@Request() req: any) {
    return this.reliefService.getDonors(this.extractTenantId(req));
  }

  @Post('donors/pledge')
  @ApiOperation({ summary: 'Pledge donor sponsorship for a patient treatment deficit' })
  createPledge(@Request() req: any, @Body() dto: CreateDonorPledgeDto) {
    return this.reliefService.createDonorPledge(this.extractTenantId(req), dto);
  }
}
