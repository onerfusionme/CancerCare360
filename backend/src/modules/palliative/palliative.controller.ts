import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PalliativeService } from './palliative.service';
import { CreatePalliativeClinicDto } from './dto/create-clinic.dto';
import { UpdatePalliativeClinicDto } from './dto/update-clinic.dto';
import { CreatePalliativeAssessmentDto } from './dto/create-assessment.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Pain & Palliative Oncology')
@Controller('palliative')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@UseInterceptors(AuditInterceptor)
export class PalliativeController {
  constructor(private readonly palliativeService: PalliativeService) {}

  @Get('clinics')
  @ApiOperation({ summary: 'Search and filter pain & palliative clinics by geography and services' })
  async getClinics(
    @Query('city') city?: string,
    @Query('service') service?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.palliativeService.getClinics({ city, service, search });
    return { success: true, data };
  }

  @Post('clinics')
  @ApiOperation({ summary: 'Onboard a new pain & palliative clinic center' })
  async onboardClinic(
    @Body() dto: CreatePalliativeClinicDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.palliativeService.onboardClinic(dto);
    return {
      success: true,
      data,
      message: `Pain clinic "${dto.name}" in ${dto.city} onboarded successfully`,
    };
  }

  @Put('clinics/:id')
  @ApiOperation({ summary: 'Update an existing pain & palliative clinic center' })
  async updateClinic(
    @Param('id') id: string,
    @Body() dto: UpdatePalliativeClinicDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.palliativeService.updateClinic(id, dto);
    return {
      success: true,
      data,
      message: `Pain clinic "${data.name}" updated successfully`,
    };
  }

  @Delete('clinics/:id')
  @ApiOperation({ summary: 'Delete an existing pain & palliative clinic center' })
  async deleteClinic(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.palliativeService.deleteClinic(id);
    return {
      success: true,
      data,
      message: data.message,
    };
  }

  @Get('assessments')
  @ApiOperation({ summary: 'Get all recent ESAS Total Pain assessments' })
  async getAllAssessments(): Promise<ApiResponseDto<any>> {
    const data = await this.palliativeService.getAllAssessments();
    return { success: true, data };
  }

  @Get('assessments/:patientId')
  @ApiOperation({ summary: 'Get longitudinal ESAS Total Pain assessments for a patient' })
  async getPatientAssessments(
    @Param('patientId') patientId: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.palliativeService.getPatientAssessments(patientId);
    return { success: true, data };
  }

  @Post('assessments')
  @ApiOperation({ summary: 'Submit a multi-dimensional Digital ESAS Total Pain assessment' })
  async submitAssessment(
    @Body() dto: CreatePalliativeAssessmentDto,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.palliativeService.submitAssessment(dto);
    return {
      success: true,
      data,
      message: `Total Pain assessment submitted. Severity: ${data.severityLevel}`,
    };
  }
}
