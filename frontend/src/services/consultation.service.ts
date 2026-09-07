import apiClient from './api-client';

export const consultationService = {
  getConsultationReadiness: (patientId: string) => apiClient.get(`/api/v1/consultation-readiness/${patientId}`).then(res => res.data),
  getSinceLastVisit: (patientId: string) => apiClient.get(`/api/v1/consultation-readiness/${patientId}/since-last-visit`).then(res => res.data)
};
