import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FhirMapperService } from './fhir-mapper.service';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fhirMapper: FhirMapperService,
  ) {}

  async handleInboundWebhook(tenantId: string, sourceSystem: string, payload: any) {
    await (this.prisma as any).auditLog.create({
      data: {
        tenantId,
        userId: 'SYSTEM',
        action: 'INBOUND_WEBHOOK_PROCESSED',
        resourceType: 'WEBHOOK',
        details: JSON.stringify({ sourceSystem, payload }),
        createdAt: new Date(),
      },
    });

    if (payload.type === 'LAB_RESULT') {
      const investigationId = payload.investigationId;
      if (investigationId) {
        await this.prisma.investigation.update({
          where: { id: investigationId },
          data: {
            status: 'REPORT_AVAILABLE',
            reportAvailableAt: new Date(),
            resultSummary: payload.result,
          },
        });
      }
    } else if (payload.type === 'PATIENT_ADMISSION') {
      // Inbound admission update
    }

    return { success: true, message: 'Webhook processed' };
  }

  async exportPatientFhir(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      include: {
        appointments: true,
        careJourneys: true,
        investigations: true,
      },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const patientWithRelations = patient as any;
    const fhirPatient = this.fhirMapper.mapPatientToFhir(patient);
    const entries = [
      { resource: fhirPatient },
      ...(patientWithRelations.appointments || []).map((a: any) => ({ resource: this.fhirMapper.mapAppointmentToFhir(a) })),
      ...(patientWithRelations.careJourneys || []).map((j: any) => ({ resource: this.fhirMapper.mapJourneyToFhir(j) })),
      ...(patientWithRelations.investigations || []).map((i: any) => ({ resource: this.fhirMapper.mapInvestigationToFhir(i) })),
    ];

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: 'EXPORT_FHIR',
        resourceType: 'Patient',
        resourceId: patientId,
        newValue: { exportedAt: new Date().toISOString() } as any,
      },
    });

    return {
      resourceType: 'Bundle',
      type: 'collection',
      entry: entries,
    };
  }
}
