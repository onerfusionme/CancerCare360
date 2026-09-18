import apiClient from './api-client';

export const journeyService = {
  getJourneys: (filters?: any) => apiClient.get('/api/v1/journeys', { params: filters }).then(res => {
    const d = res.data?.data !== undefined ? res.data.data : res.data;
    return Array.isArray(d) ? d : [];
  }),
  getJourney: (id: string) => apiClient.get(`/api/v1/journeys/${id}`).then(res => res.data?.data || res.data),
  createJourney: (dto: any) => apiClient.post('/api/v1/journeys', dto).then(res => res.data?.data || res.data),
  updateJourney: (id: string, dto: any) => apiClient.patch(`/api/v1/journeys/${id}`, dto).then(res => res.data?.data || res.data),
  closeJourney: (id: string) => apiClient.patch(`/api/v1/journeys/${id}/close`).then(res => res.data?.data || res.data),
  getTimeline: (journeyId: string) => apiClient.get(`/api/v1/journeys/${journeyId}/timeline`).then(res => {
    const d = res.data?.data !== undefined ? res.data.data : res.data;
    return Array.isArray(d) ? d : [];
  }),
  getPatientTimeline: (patientId: string) => apiClient.get(`/api/v1/journeys/patient/${patientId}/timeline`).then(res => {
    const d = res.data?.data !== undefined ? res.data.data : res.data;
    return Array.isArray(d) ? d : [];
  })
};
