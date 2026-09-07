import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { ConsentRequestDto } from './dto/consent-request.dto';
import { EducationService } from '../education/education.service';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class PatientPortalService {
  constructor(
    private prisma: PrismaService,
    private educationService: EducationService,
  ) {}

  async getProfile(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      include: {
        careJourneys: {
          take: 1,
          orderBy: { startedAt: 'desc' },
          include: {
            primaryDoctor: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const activeJourney = patient.careJourneys?.[0];

    return {
      id: patient.id,
      mrn: patient.mrn,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      preferredLanguage: patient.preferredLanguage,
      communicationPreferences: patient.communicationPreferences,
      abhaId: patient.abhaId,
      careStage: activeJourney?.careStage || 'ACTIVE_TREATMENT',
      primaryDoctor: activeJourney?.primaryDoctor
        ? `Dr. ${activeJourney.primaryDoctor.firstName} ${activeJourney.primaryDoctor.lastName}`
        : 'Assigned Oncology Team',
    };
  }

  async updatePreferences(tenantId: string, patientId: string, dto: UpdatePreferencesDto, userId: string) {
    const patient = await this.prisma.patient.findFirst({ where: { id: patientId, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const updated = await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        preferredLanguage: dto.preferredLanguage !== undefined ? dto.preferredLanguage : patient.preferredLanguage,
        communicationPreferences: dto.communicationPreferences ? (dto.communicationPreferences as any) : patient.communicationPreferences,
      },
    });

    // Record immutable audit entry for DPDP Act 2023 compliance (§33)
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'UPDATE_COMMUNICATION_CONSENT',
        resourceType: 'Patient',
        resourceId: patientId,
        previousValue: {
          preferredLanguage: patient.preferredLanguage,
          communicationPreferences: patient.communicationPreferences,
        } as any,
        newValue: {
          preferredLanguage: updated.preferredLanguage,
          communicationPreferences: updated.communicationPreferences,
        } as any,
      },
    });

    return updated;
  }

  async getAppointments(tenantId: string, patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId, tenantId },
      include: {
        doctor: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getJourneyTimeline(tenantId: string, patientId: string) {
    const events = await this.prisma.journeyEvent.findMany({
      where: { patientId, tenantId },
      include: {
        department: { select: { name: true } },
        responsibleUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { eventDate: 'desc' },
    });

    return events.map((event) => ({
      id: event.id,
      date: event.eventDate,
      type: event.eventType,
      status: event.status,
      notes: event.notes,
      department: event.department?.name,
      responsiblePerson: event.responsibleUser
        ? `Dr. ${event.responsibleUser.firstName} ${event.responsibleUser.lastName}`
        : undefined,
    }));
  }

  async getDocuments(tenantId: string, patientId: string) {
    const documents = await this.prisma.document.findMany({
      where: {
        patientId,
        tenantId,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      select: {
        id: true,
        fileName: true,
        documentType: true,
        fileSize: true,
        createdAt: true,
        verificationStatus: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map((doc) => ({
      ...doc,
      downloadUrl: `/api/v1/documents/${doc.id}/download`,
    }));
  }

  async getPublishedEducation(tenantId: string, language?: string) {
    return this.educationService.findPublished(tenantId, undefined, language);
  }

  async recordConsent(tenantId: string, patientId: string, dto: ConsentRequestDto) {
    const patient = await this.prisma.patient.findFirst({ where: { id: patientId, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const consentArtefact = {
      purpose: dto.purpose,
      scope: dto.scope,
      abhaId: dto.abhaId || patient.abhaId,
      status: 'ACTIVE',
      grantedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + dto.durationDays * 24 * 60 * 60 * 1000).toISOString(),
    };

    const currentPrefs = (patient.communicationPreferences as Record<string, any>) || {};
    const updated = await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        communicationPreferences: {
          ...currentPrefs,
          consentArtefact,
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: patientId,
        action: 'GRANT_ABDM_CONSENT_ARTEFACT',
        resourceType: 'PatientConsent',
        resourceId: patientId,
        newValue: consentArtefact as any,
      },
    });

    return consentArtefact;
  }

  async revokeConsent(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({ where: { id: patientId, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const currentPrefs = (patient.communicationPreferences as Record<string, any>) || {};
    const updated = await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        communicationPreferences: {
          ...currentPrefs,
          sms: false,
          email: false,
          whatsapp: false,
          consentArtefact: {
            status: 'REVOKED',
            revokedAt: new Date().toISOString(),
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: patientId,
        action: 'REVOKE_ALL_DIGITAL_CONSENT',
        resourceType: 'PatientConsent',
        resourceId: patientId,
      },
    });

    return { status: 'REVOKED', message: 'All digital communication consents have been revoked successfully.' };
  }
}

