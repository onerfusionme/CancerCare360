import apiClient from './api-client';
import { CreateInvestigationDto, UpdateInvestigationDto, InvestigationFilter, Investigation, InvestigationStatus, InvestigationType } from '../types/investigation';

export const investigationService = {
  getInvestigations: async (filters?: InvestigationFilter): Promise<Investigation[]> => {
    const response = await apiClient.get('/api/v1/investigations', { params: filters });
    return response.data;
  },
  
  getInvestigation: async (id: string): Promise<Investigation> => {
    const response = await apiClient.get(`/api/v1/investigations/${id}`);
    return response.data;
  },
  
  createInvestigation: async (dto: CreateInvestigationDto): Promise<Investigation> => {
    const response = await apiClient.post('/api/v1/investigations', dto);
    return response.data;
  },
  
  updateInvestigation: async (id: string, dto: UpdateInvestigationDto): Promise<Investigation> => {
    const response = await apiClient.patch(`/api/v1/investigations/${id}`, dto);
    return response.data;
  },
  
  deleteInvestigation: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/api/v1/investigations/${id}`);
    return response.data;
  },
  
  getPendingInvestigations: async (): Promise<Investigation[]> => {
    const response = await apiClient.get('/api/v1/investigations', { params: { status: 'ORDERED' } });
    return response.data;
  }
};
