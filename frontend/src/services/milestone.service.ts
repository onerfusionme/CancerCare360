import apiClient from './api-client';
import { CreateMilestoneDto, CreateTemplateDto } from '../types/milestone';

export const milestoneService = {
  getMilestones: (journeyId: string) => apiClient.get(`/api/v1/milestones`, { params: { journeyId } }).then(res => {
    const d = res.data?.data !== undefined ? res.data.data : res.data;
    return Array.isArray(d) ? d : [];
  }),
  getOverdueMilestones: () => apiClient.get('/api/v1/milestones/overdue').then(res => {
    const d = res.data?.data !== undefined ? res.data.data : res.data;
    return Array.isArray(d) ? d : [];
  }),
  updateMilestone: (id: string, dto: any) => apiClient.patch(`/api/v1/milestones/${id}`, dto).then(res => res.data?.data || res.data),
  getTemplates: (diagnosisCategory?: string) => apiClient.get('/api/v1/milestone-templates', { params: { diagnosisCategory } }).then(res => {
    const d = res.data?.data !== undefined ? res.data.data : res.data;
    return Array.isArray(d) ? d : [];
  }),
  createTemplate: (dto: CreateTemplateDto) => apiClient.post('/api/v1/milestone-templates', dto).then(res => res.data?.data || res.data)
};
