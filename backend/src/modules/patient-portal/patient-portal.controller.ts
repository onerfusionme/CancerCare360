import { Controller, Get, Post, Put, Body, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { PatientPortalService } from './patient-portal.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { ConsentRequestDto } from './dto/consent-request.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('patient-portal')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('portal')
export class PatientPortalController {
  constructor(private readonly patientPortalService: PatientPortalService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get patient profile' })
  getProfile(@Request() req: any, @Query('patientId') patientId?: string) {
    return this.patientPortalService.getProfile(req.tenantId || req.user.tenantId, patientId || req.user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update patient communication preferences' })
  updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto, @Query('patientId') patientId?: string) {
    return this.patientPortalService.updatePreferences(req.tenantId || req.user.tenantId, patientId || req.user.id, dto, req.user?.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update patient communication preferences (PUT)' })
  updatePreferencesPut(@Request() req: any, @Body() dto: UpdatePreferencesDto, @Query('patientId') patientId?: string) {
    return this.patientPortalService.updatePreferences(req.tenantId || req.user.tenantId, patientId || req.user.id, dto, req.user?.id);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get patient appointments' })
  getAppointments(@Request() req: any, @Query('patientId') patientId?: string) {
    return this.patientPortalService.getAppointments(req.tenantId || req.user.tenantId, patientId || req.user.id);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get patient journey timeline' })
  getTimeline(@Request() req: any, @Query('patientId') patientId?: string) {
    return this.patientPortalService.getJourneyTimeline(req.tenantId || req.user.tenantId, patientId || req.user.id);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get patient documents' })
  getDocuments(@Request() req: any, @Query('patientId') patientId?: string) {
    return this.patientPortalService.getDocuments(req.tenantId || req.user.tenantId, patientId || req.user.id);
  }

  @Get('education')
  @ApiOperation({ summary: 'Get published education content' })
  getEducation(@Request() req: any, @Query('language') language?: string, @Query('lang') lang?: string) {
    return this.patientPortalService.getPublishedEducation(req.tenantId || req.user.tenantId, language || lang);
  }

  @Get('education/recommended')
  @ApiOperation({ summary: 'Get recommended education content for patient' })
  getRecommendedEducation(@Request() req: any, @Query('patientId') patientId?: string) {
    return this.patientPortalService.getRecommendedEducation(req.tenantId || req.user.tenantId, patientId || req.user.id);
  }

  @Post('consent')
  @ApiOperation({ summary: 'Record patient consent' })
  recordConsent(@Request() req: any, @Body() dto: ConsentRequestDto, @Query('patientId') patientId?: string) {
    return this.patientPortalService.recordConsent(req.tenantId || req.user.tenantId, patientId || req.user.id, dto);
  }

  @Post('consent/revoke')
  @ApiOperation({ summary: 'Revoke patient consent' })
  revokeConsent(@Request() req: any, @Query('patientId') patientId?: string) {
    return this.patientPortalService.revokeConsent(req.tenantId || req.user.tenantId, patientId || req.user.id);
  }
}
