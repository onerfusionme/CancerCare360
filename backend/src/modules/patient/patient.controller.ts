import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientFilterDto } from './dto/patient-filter.dto';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Patients')
@Controller('patients')
@UseGuards(AuthGuard('jwt'), TenantGuard, RbacGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: false, description: 'Tenant ID (if not resolved from user context)' })
@UseInterceptors(AuditInterceptor)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @Permissions('patient:write')
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() createPatientDto: CreatePatientDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.patientService.create(tenantId, createPatientDto);
    return { success: true, data, message: 'Patient created successfully' };
  }

  @Get()
  @Permissions('patient:read')
  @ApiOperation({ summary: 'List all patients with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of patients' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() filterDto: PatientFilterDto,
  ): Promise<ApiResponseDto<PaginatedResponseDto<any>>> {
    const data = await this.patientService.findAll(tenantId, filterDto);
    return { success: true, data: data as any };
  }

  @Get('search')
  @Permissions('patient:read')
  @ApiOperation({ summary: 'Global search for patients (name, mrn, phone)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @CurrentTenant() tenantId: string,
    @Query('q') query: string,
  ): Promise<ApiResponseDto<any[]>> {
    const data = await this.patientService.search(tenantId, query);
    return { success: true, data };
  }

  @Get('duplicates')
  @Permissions('patient:read')
  @ApiOperation({ summary: 'Check for potential duplicates before creation' })
  @ApiResponse({ status: 200, description: 'Potential duplicates' })
  async findDuplicates(
    @CurrentTenant() tenantId: string,
    @Query() queryDto: Partial<CreatePatientDto>,
  ): Promise<ApiResponseDto<any[]>> {
    const data = await this.patientService.findDuplicates(tenantId, queryDto);
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('patient:read')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.patientService.findById(tenantId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @Permissions('patient:write')
  @ApiOperation({ summary: 'Update patient details' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.patientService.update(tenantId, id, updatePatientDto);
    return { success: true, data, message: 'Patient updated successfully' };
  }

  @Put(':id')
  @Permissions('patient:write')
  @ApiOperation({ summary: 'Update patient details (REST PUT alias)' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  async updatePut(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.patientService.update(tenantId, id, updatePatientDto);
    return { success: true, data, message: 'Patient updated successfully' };
  }

  @Delete(':id')
  @Permissions('patient:write')
  @ApiOperation({ summary: 'Delete or archive patient record' })
  @ApiResponse({ status: 200, description: 'Patient deleted or archived successfully' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.patientService.delete(tenantId, id);
    return { success: true, data, message: 'Patient record removed successfully' };
  }

  @Get(':id/journey')
  @Permissions('patient:read')
  @ApiOperation({ summary: 'Get patient care journey summary' })
  @ApiResponse({ status: 200, description: 'Patient journey' })
  async getJourney(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<any[]>> {
    const data = await this.patientService.getPatientJourney(tenantId, id);
    return { success: true, data };
  }
}
