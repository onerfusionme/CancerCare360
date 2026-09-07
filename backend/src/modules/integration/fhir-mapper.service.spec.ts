import { FhirMapperService } from './fhir-mapper.service';

describe('FhirMapperService', () => {
  let service: FhirMapperService;

  beforeEach(() => {
    service = new FhirMapperService();
  });

  describe('mapPatientToFhir', () => {
    it('should map internal Patient to valid FHIR R4 Patient resource', () => {
      const mockPatient = {
        id: 'patient-123',
        mrn: 'MRN-98765',
        abhaId: '91-1234-5678-9012',
        name: 'Jane Doe',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+919876543210',
        gender: 'FEMALE',
        dateOfBirth: new Date('1985-05-15'),
        address: '123 Marine Drive, Mumbai',
      };

      const fhir = service.mapPatientToFhir(mockPatient);

      expect(fhir.resourceType).toBe('Patient');
      expect(fhir.id).toBe('patient-123');
      expect(fhir.identifier).toEqual([
        { system: 'http://hospital.org/mrn', value: 'MRN-98765' },
        { system: 'https://healthid.ndhm.gov.in', value: '91-1234-5678-9012' },
      ]);
      expect(fhir.gender).toBe('female');
      expect(fhir.birthDate).toBe('1985-05-15');
      expect(fhir.telecom[0].value).toBe('+919876543210');
    });
  });

  describe('mapAppointmentToFhir', () => {
    it('should map Appointment to FHIR R4 Encounter resource', () => {
      const mockAppointment = {
        id: 'appt-456',
        patientId: 'patient-123',
        doctorId: 'doc-789',
        status: 'CONFIRMED',
        type: 'CHEMO_CONSULTATION',
        scheduledTime: new Date('2026-10-01T10:00:00Z'),
      };

      const fhir = service.mapAppointmentToFhir(mockAppointment);

      expect(fhir.resourceType).toBe('Encounter');
      expect(fhir.id).toBe('appt-456');
      expect(fhir.status).toBe('confirmed');
      expect(fhir.subject.reference).toBe('Patient/patient-123');
      expect(fhir.participant[0].individual.reference).toBe('Practitioner/doc-789');
    });
  });

  describe('mapInvestigationToFhir', () => {
    it('should map Investigation to FHIR R4 DiagnosticReport', () => {
      const mockInvestigation = {
        id: 'inv-101',
        patientId: 'patient-123',
        status: 'FINAL',
        type: 'HISTOPATHOLOGY',
        resultDate: new Date('2026-09-01T14:30:00Z'),
      };

      const fhir = service.mapInvestigationToFhir(mockInvestigation);

      expect(fhir.resourceType).toBe('DiagnosticReport');
      expect(fhir.id).toBe('inv-101');
      expect(fhir.subject.reference).toBe('Patient/patient-123');
      expect(fhir.category[0].coding[0].code).toBe('HISTOPATHOLOGY');
    });
  });
});
