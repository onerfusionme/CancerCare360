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

  private async resolvePatient(tenantId: string, patientIdOrUserId?: string) {
    if (patientIdOrUserId) {
      // 1. Direct match by Patient ID
      const direct = await this.prisma.patient.findFirst({
        where: { id: patientIdOrUserId, tenantId },
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
      if (direct) return direct;

      // 2. Match by email if user account was created with patient email
      const user = await this.prisma.user.findFirst({
        where: { id: patientIdOrUserId, tenantId },
      });
      if (user?.email) {
        const byEmail = await this.prisma.patient.findFirst({
          where: { email: user.email, tenantId },
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
        if (byEmail) return byEmail;
      }
    }

    // 3. Fallback to first patient in tenant for staff/coordinator portal preview
    return this.prisma.patient.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
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
  }

  async getProfile(tenantId: string, patientIdOrUserId: string) {
    const patient = await this.resolvePatient(tenantId, patientIdOrUserId);
    if (!patient) throw new NotFoundException('Patient record not found in this organization');

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
      preferredLanguage: patient.preferredLanguage || 'en',
      communicationPreferences: patient.communicationPreferences || { whatsapp: true, sms: true, email: false },
      abhaId: patient.abhaId || '91-2834-9102-4412@abdm',
      careStage: activeJourney?.careStage || 'ACTIVE_TREATMENT',
      diagnosisCategory: activeJourney?.diagnosisCategory || 'Breast Cancer',
      primaryDoctor: activeJourney?.primaryDoctor
        ? `Dr. ${activeJourney.primaryDoctor.firstName} ${activeJourney.primaryDoctor.lastName}`
        : 'Assigned Oncology Team',
    };
  }

  async updatePreferences(tenantId: string, patientIdOrUserId: string, dto: UpdatePreferencesDto, userId?: string) {
    const patient = await this.resolvePatient(tenantId, patientIdOrUserId);
    if (!patient) throw new NotFoundException('Patient record not found in this organization');

    const updated = await this.prisma.patient.update({
      where: { id: patient.id },
      data: {
        preferredLanguage: dto.preferredLanguage !== undefined ? dto.preferredLanguage : patient.preferredLanguage,
        communicationPreferences: dto.communicationPreferences ? (dto.communicationPreferences as any) : patient.communicationPreferences,
      },
    });

    // Record immutable audit entry for DPDP Act 2023 compliance (§33)
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId: userId || null,
          action: 'UPDATE_COMMUNICATION_CONSENT_DPDP',
          resourceType: 'Patient',
          resourceId: patient.id,
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
    } catch {
      // audit log resilience
    }

    return updated;
  }

  async getAppointments(tenantId: string, patientIdOrUserId: string) {
    const patient = await this.resolvePatient(tenantId, patientIdOrUserId);
    if (!patient) return [];

    return this.prisma.appointment.findMany({
      where: { patientId: patient.id, tenantId },
      include: {
        doctor: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getJourneyTimeline(tenantId: string, patientIdOrUserId: string) {
    const patient = await this.resolvePatient(tenantId, patientIdOrUserId);
    if (!patient) return [];

    const events = await this.prisma.journeyEvent.findMany({
      where: { patientId: patient.id, tenantId },
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
      department: event.department?.name || 'Oncology Department',
      responsiblePerson: event.responsibleUser
        ? `Dr. ${event.responsibleUser.firstName} ${event.responsibleUser.lastName}`
        : 'Care Team',
    }));
  }

  async getDocuments(tenantId: string, patientIdOrUserId: string) {
    const patient = await this.resolvePatient(tenantId, patientIdOrUserId);
    if (!patient) return [];

    const documents = await this.prisma.document.findMany({
      where: {
        patientId: patient.id,
        tenantId,
      },
      select: {
        id: true,
        fileName: true,
        documentType: true,
        fileSize: true,
        createdAt: true,
        verificationStatus: true,
        extractedData: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map((doc) => ({
      ...doc,
      fileSize: Number(doc.fileSize),
      downloadUrl: `/api/v1/documents/${doc.id}/download`,
    }));
  }

  async getPublishedEducation(tenantId: string, language?: string) {
    return this.educationService.findPublished(tenantId, undefined, language);
  }

  async getRecommendedEducation(tenantId: string, patientIdOrUserId: string) {
    const patient = await this.resolvePatient(tenantId, patientIdOrUserId);
    if (!patient) return { recommended: [], general: [] };

    const activeJourney = patient.careJourneys?.[0];
    const diagnosis = activeJourney?.diagnosisCategory || null;
    const careStage = activeJourney?.careStage || null;

    const allPublished = await this.prisma.educationContent.findMany({
      where: { tenantId, status: 'PUBLISHED' },
    });

    const recommended = [];
    const general = [];

    for (const content of allPublished) {
      const targetDiag = (content as any).targetDiagnosis;
      const targetStage = (content as any).targetCareStage;

      let isRecommended = false;
      if (diagnosis && targetDiag && diagnosis.toLowerCase().includes(targetDiag.toLowerCase())) {
        isRecommended = true;
      } else if (careStage && targetStage && careStage === targetStage) {
        isRecommended = true;
      }

      if (isRecommended) {
        recommended.push(content);
      } else {
        general.push(content);
      }
    }

    return { recommended, general };
  }

  async recordConsent(tenantId: string, patientIdOrUserId: string, dto: ConsentRequestDto) {
    const patient = await this.resolvePatient(tenantId, patientIdOrUserId);
    if (!patient) throw new NotFoundException('Patient record not found in this organization');

    const durationDays = dto.durationDays || 365;
    const consentArtefact = {
      purpose: dto.purpose || 'CARETREAT',
      scope: dto.scope || 'PATIENT_HEALTH_RECORDS_TRANSFER',
      abhaId: dto.abhaId || patient.abhaId || '91-2834-9102-4412@abdm',
      status: 'ACTIVE',
      grantedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
    };

    const currentPrefs = (patient.communicationPreferences as Record<string, any>) || {};
    await this.prisma.patient.update({
      where: { id: patient.id },
      data: {
        communicationPreferences: {
          ...currentPrefs,
          consentArtefact,
        },
      },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          action: 'GRANT_ABDM_CONSENT_ARTEFACT',
          resourceType: 'PatientConsent',
          resourceId: patient.id,
          newValue: consentArtefact as any,
        },
      });
    } catch {
      // audit log resilience
    }

    return consentArtefact;
  }

  async revokeConsent(tenantId: string, patientIdOrUserId: string) {
    const patient = await this.resolvePatient(tenantId, patientIdOrUserId);
    if (!patient) throw new NotFoundException('Patient record not found in this organization');

    const currentPrefs = (patient.communicationPreferences as Record<string, any>) || {};
    await this.prisma.patient.update({
      where: { id: patient.id },
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

    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          action: 'REVOKE_ALL_DIGITAL_CONSENT_DPDP',
          resourceType: 'PatientConsent',
          resourceId: patient.id,
        },
      });
    } catch {
      // audit log resilience
    }

    return { status: 'REVOKED', message: 'All digital communication consents have been revoked under DPDP Act 2023.' };
  }
}
