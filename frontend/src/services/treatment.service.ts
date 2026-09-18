import apiClient from './api-client';
import { CreateTreatmentDto, UpdateTreatmentDto, TreatmentFilter } from '../types/treatment';

export const treatmentService = {
  getTreatments: (filters?: TreatmentFilter) => apiClient.get('/api/v1/treatments', { params: filters }).then(res => {
    const d = res.data?.data !== undefined ? res.data.data : res.data;
    return Array.isArray(d) ? d : [];
  }),
  getTreatment: (id: string) => apiClient.get(`/api/v1/treatments/${id}`).then(res => res.data?.data || res.data),
  createTreatment: (dto: CreateTreatmentDto) => apiClient.post('/api/v1/treatments', dto).then(res => res.data?.data || res.data),
  updateTreatment: (id: string, dto: UpdateTreatmentDto) => apiClient.patch(`/api/v1/treatments/${id}`, dto).then(res => res.data?.data || res.data),
  getPatientTreatments: (patientId: string) => apiClient.get(`/api/v1/treatments/patient/${patientId}`).then(res => {
    const d = res.data?.data !== undefined ? res.data.data : res.data;
    return Array.isArray(d) ? d : [];
  })
};
