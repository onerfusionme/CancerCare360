import apiClient from './api-client';
import { OutreachLog, CreateOutreachDto, ContactSummary } from '@/types/outreach';

const API_URL = '/api/v1/outreach';

export const outreachService = {
  logOutreach: async (dto: CreateOutreachDto): Promise<OutreachLog> => {
    const { data } = await apiClient.post(API_URL, dto);
    return data?.data || data;
  },
  getTaskOutreach: async (taskId: string): Promise<OutreachLog[]> => {
    const { data } = await apiClient.get(`${API_URL}/task/${taskId}`);
    const result = data?.data || data;
    return Array.isArray(result) ? result : [];
  },
  getPatientOutreach: async (patientId: string): Promise<OutreachLog[]> => {
    const { data } = await apiClient.get(`${API_URL}/patient/${patientId}`);
    const result = data?.data || data;
    return Array.isArray(result) ? result : [];
  },
  getContactSummary: async (patientId: string): Promise<ContactSummary> => {
    const { data } = await apiClient.get(`${API_URL}/patient/${patientId}/summary`);
    return data?.data || data;
  }
};
