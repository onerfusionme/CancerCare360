import apiClient from './api-client';
import { CareGapRule, CareGap, CreateRuleDto } from '@/types/care-gap';

export const careGapService = {
  getRules: async (): Promise<CareGapRule[]> => {
    const { data } = await apiClient.get('/api/v1/care-gap-rules');
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  },
  createRule: async (dto: CreateRuleDto): Promise<CareGapRule> => {
    const { data } = await apiClient.post('/api/v1/care-gap-rules', dto);
    return data?.data || data;
  },
  updateRule: async (id: string, dto: Partial<CreateRuleDto>): Promise<CareGapRule> => {
    const { data } = await apiClient.patch(`/api/v1/care-gap-rules/${id}`, dto);
    return data?.data || data;
  },
  toggleRule: async (id: string, isActive: boolean): Promise<CareGapRule> => {
    const { data } = await apiClient.post(`/api/v1/care-gap-rules/${id}/toggle`, { isActive });
    return data?.data || data;
  },
  detectGaps: async (): Promise<CareGap[]> => {
    const { data } = await apiClient.get('/api/v1/care-gaps/detect');
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  },
  generateTasks: async (): Promise<void> => {
    await apiClient.post('/api/v1/care-gaps/generate-tasks');
  },
  deleteRule: async (id: string): Promise<any> => {
    const { data } = await apiClient.delete(`/api/v1/care-gap-rules/${id}`);
    return data?.data || data;
  },
};
