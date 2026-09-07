import { Injectable } from '@nestjs/common';

@Injectable()
export class FhirMapperService {
  mapPatientToFhir(patient: any) {
    return {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [
        { system: 'http://hospital.org/mrn', value: patient.mrn },
        { system: 'https://healthid.ndhm.gov.in', value: patient.abhaId },
      ],
      name: [{ text: patient.name, family: patient.lastName, given: [patient.firstName] }],
      telecom: [{ system: 'phone', value: patient.phone }],
      gender: patient.gender ? patient.gender.toLowerCase() : 'unknown',
      birthDate: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : null,
      address: [{ text: patient.address }],
    };
  }

  mapAppointmentToFhir(appointment: any) {
    return {
      resourceType: 'Encounter',
      id: appointment.id,
      status: appointment.status ? appointment.status.toLowerCase() : 'unknown',
      class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' },
      type: [{ text: appointment.type }],
      subject: { reference: `Patient/${appointment.patientId}` },
      participant: [{ individual: { reference: `Practitioner/${appointment.doctorId}` } }],
      period: {
        start: appointment.scheduledTime ? new Date(appointment.scheduledTime).toISOString() : null,
      },
    };
  }

  mapJourneyToFhir(journey: any) {
    return {
      resourceType: 'CarePlan',
      id: journey.id,
      status: journey.status ? journey.status.toLowerCase() : 'unknown',
      intent: 'plan',
      subject: { reference: `Patient/${journey.patientId}` },
      description: `Stage: ${journey.currentStage}`,
    };
  }

  mapInvestigationToFhir(investigation: any) {
    return {
      resourceType: 'DiagnosticReport',
      id: investigation.id,
      status: investigation.status ? investigation.status.toLowerCase() : 'unknown',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: investigation.type }] }],
      subject: { reference: `Patient/${investigation.patientId}` },
      issued: investigation.resultDate ? new Date(investigation.resultDate).toISOString() : null,
    };
  }
}
