import { PatientPortalService } from './patient-portal.service';

describe('PatientPortalService', () => {
  let service: PatientPortalService;
  let mockPrisma: any;
  let mockEducationService: any;

  beforeEach(() => {
    mockPrisma = {
      patient: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      appointment: {
        findMany: jest.fn(),
      },
      journeyEvent: {
        findMany: jest.fn(),
      },
      document: {
        findMany: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };
    mockEducationService = {
      findPublished: jest.fn(),
    };
    service = new PatientPortalService(mockPrisma, mockEducationService);
  });

  describe('recordConsent', () => {
    it('should generate ABDM consent artefact and record immutable DPDP audit log', async () => {
      const mockPatient = {
        id: 'patient-uuid',
        abhaId: '91-1234-5678-9012',
        communicationPreferences: { sms: true },
      };
      mockPrisma.patient.findFirst.mockResolvedValue(mockPatient);
      mockPrisma.patient.update.mockResolvedValue({ ...mockPatient });
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'audit-log-uuid' });

      const consentDto = {
        purpose: 'CARE_COORDINATION',
        scope: 'CLINICAL_RECORDS',
        durationDays: 365,
      };

      const result = await service.recordConsent('tenant-uuid', 'patient-uuid', consentDto as any);

      expect(result.status).toBe('ACTIVE');
      expect(result.purpose).toBe('CARE_COORDINATION');
      expect(result.abhaId).toBe('91-1234-5678-9012');
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'GRANT_ABDM_CONSENT_ARTEFACT',
            resourceType: 'PatientConsent',
            resourceId: 'patient-uuid',
          }),
        }),
      );
    });
  });

  describe('revokeConsent', () => {
    it('should revoke all digital communications and record revocation in audit log', async () => {
      const mockPatient = {
        id: 'patient-uuid',
        communicationPreferences: { sms: true, whatsapp: true, email: true },
      };
      mockPrisma.patient.findFirst.mockResolvedValue(mockPatient);
      mockPrisma.patient.update.mockResolvedValue({ ...mockPatient });
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'audit-log-uuid' });

      const result = await service.revokeConsent('tenant-uuid', 'patient-uuid');

      expect(result.status).toBe('REVOKED');
      expect(mockPrisma.patient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            communicationPreferences: expect.objectContaining({
              sms: false,
              whatsapp: false,
              email: false,
              consentArtefact: expect.objectContaining({ status: 'REVOKED' }),
            }),
          }),
        }),
      );
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'REVOKE_ALL_DIGITAL_CONSENT',
            resourceType: 'PatientConsent',
          }),
        }),
      );
    });
  });
});
