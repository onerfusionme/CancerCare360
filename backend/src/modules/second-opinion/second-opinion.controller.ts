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
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { SecondOpinionService } from './second-opinion.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateConsensusDto } from './dto/update-consensus.dto';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { SecondOpinionStatus } from '@prisma/client';

@ApiTags('Second Opinion Hub')
@ApiBearerAuth()
@UseGuards(OptionalAuthGuard)
@Controller('second-opinion')
export class SecondOpinionController {
  constructor(private readonly service: SecondOpinionService) {}

  private extractTenantId(req: any): string {
    return req?.user?.tenantId || req?.tenantId || 'd3b07384-d113-494d-9c3f-c1f9c8d506a1';
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get KPI metrics for second opinion cases, discordance rate, and TAT' })
  getMetrics(@Request() req: any) {
    return this.service.getMetrics(this.extractTenantId(req));
  }

  @Get()
  @ApiOperation({ summary: 'List all second opinion cases with optional filters' })
  findAll(
    @Request() req: any,
    @Query('status') status?: SecondOpinionStatus,
    @Query('cancerType') cancerType?: string,
    @Query('clinicalUrgency') clinicalUrgency?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(this.extractTenantId(req), {
      status,
      cancerType,
      clinicalUrgency,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve full case dossier, uploaded diagnostics, and consensus review' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.service.findOne(this.extractTenantId(req), id);
  }

  @Post('inquiry')
  @ApiOperation({ summary: 'Submit a new second opinion case inquiry (Patient Portal / Web)' })
  createInquiry(@Request() req: any, @Body() dto: CreateInquiryDto) {
    const tenantId = req?.user?.tenantId || req?.tenantId;
    return this.service.createInquiry(dto, tenantId);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign a specialist oncologist to review case' })
  assignDoctor(@Request() req: any, @Param('id') id: string, @Body() dto: AssignDoctorDto) {
    return this.service.assignDoctor(this.extractTenantId(req), id, dto.doctorId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update case status in workflow' })
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: SecondOpinionStatus,
  ) {
    return this.service.updateStatus(this.extractTenantId(req), id, status);
  }

  @Patch(':id/consensus')
  @ApiOperation({ summary: 'Save expert consensus opinion and treatment comparison matrix' })
  updateConsensus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateConsensusDto,
  ) {
    return this.service.updateConsensus(this.extractTenantId(req), id, dto);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert second opinion case into an active registered patient journey' })
  convertToPatient(@Request() req: any, @Param('id') id: string) {
    return this.service.convertToPatient(this.extractTenantId(req), id);
  }
}
