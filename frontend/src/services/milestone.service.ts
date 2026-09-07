import apiClient from './api-client';
import { CreateMilestoneDto, CreateTemplateDto } from '../types/milestone';

export const milestoneService = {
  getMilestones: (journeyId: string) => apiClient.get(`/api/v1/milestones`, { params: { journeyId } }).then(res => res.data),
  getOverdueMilestones: () => apiClient.get('/api/v1/milestones/overdue').then(res => res.data),
  updateMilestone: (id: string, dto: any) => apiClient.patch(`/api/v1/milestones/${id}`, dto).then(res => res.data),
  getTemplates: (diagnosisCategory?: string) => apiClient.get('/api/v1/milestone-templates', { params: { diagnosisCategory } }).then(res => res.data),
  createTemplate: (dto: CreateTemplateDto) => apiClient.post('/api/v1/milestone-templates', dto).then(res => res.data)
};
