import apiClient from './api-client';
import { CreateInvestigationDto, UpdateInvestigationDto, InvestigationFilter } from '../types/investigation';

export const investigationService = {
  getInvestigations: (filters?: InvestigationFilter) => apiClient.get('/api/v1/investigations', { params: filters }).then(res => res.data),
  getInvestigation: (id: string) => apiClient.get(`/api/v1/investigations/${id}`).then(res => res.data),
  createInvestigation: (dto: CreateInvestigationDto) => apiClient.post('/api/v1/investigations', dto).then(res => res.data),
  updateInvestigation: (id: string, dto: UpdateInvestigationDto) => apiClient.patch(`/api/v1/investigations/${id}`, dto).then(res => res.data),
  getPendingInvestigations: () => apiClient.get('/api/v1/investigations/pending').then(res => res.data)
};
