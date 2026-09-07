import { Controller, Get, Post, Body, Patch, UseGuards, Request, Query } from '@nestjs/common';
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
  getProfile(@Request() req: any) {
    // Assuming req.user contains the patientId in this context
    return this.patientPortalService.getProfile(req.user.tenantId, req.user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update patient communication preferences' })
  updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.patientPortalService.updatePreferences(req.user.tenantId, req.user.id, dto, req.user.id);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get patient appointments' })
  getAppointments(@Request() req: any) {
    return this.patientPortalService.getAppointments(req.user.tenantId, req.user.id);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get patient journey timeline' })
  getTimeline(@Request() req: any) {
    return this.patientPortalService.getJourneyTimeline(req.user.tenantId, req.user.id);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get patient documents' })
  getDocuments(@Request() req: any) {
    return this.patientPortalService.getDocuments(req.user.tenantId, req.user.id);
  }

  @Get('education')
  @ApiOperation({ summary: 'Get published education content' })
  getEducation(@Request() req: any, @Query('language') language?: string) {
    return this.patientPortalService.getPublishedEducation(req.user.tenantId, language);
  }

  @Post('consent')
  @ApiOperation({ summary: 'Record patient consent' })
  recordConsent(@Request() req: any, @Body() dto: ConsentRequestDto) {
    return this.patientPortalService.recordConsent(req.user.tenantId, req.user.id, dto);
  }

  @Post('consent/revoke')
  @ApiOperation({ summary: 'Revoke patient consent' })
  revokeConsent(@Request() req: any) {
    return this.patientPortalService.revokeConsent(req.user.tenantId, req.user.id);
  }
}
