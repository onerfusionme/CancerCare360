import { Controller, Post, Get, Body, Param, Request, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationService } from './integration.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('integration')
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post('webhook/inbound')
  async handleWebhook(@Headers('x-tenant-id') tenantId: string, @Headers('x-source-system') sourceSystem: string, @Body() payload: any) {
    return this.integrationService.handleInboundWebhook(tenantId, sourceSystem, payload);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, TenantGuard)
  @Get('fhir/patient/:patientId')
  async exportPatientFhir(@Request() req: any, @Param('patientId') patientId: string) {
    const tenantId = req.tenantId;
    return this.integrationService.exportPatientFhir(tenantId, patientId);
  }
}
