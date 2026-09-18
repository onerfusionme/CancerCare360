import apiClient from './api-client';
import { WaitlistEntry, CreateWaitlistDto } from '@/types/waitlist';

const API_URL = '/api/v1/waitlist';

export const waitlistService = {
  getWaitlist: async (): Promise<WaitlistEntry[]> => {
    const { data } = await apiClient.get(API_URL);
    const result = data?.data || data;
    return Array.isArray(result) ? result : [];
  },
  createWaitlistEntry: async (dto: CreateWaitlistDto): Promise<WaitlistEntry> => {
    const { data } = await apiClient.post(API_URL, dto);
    return data?.data || data;
  },
  fulfillEntry: async (id: string): Promise<WaitlistEntry> => {
    const { data } = await apiClient.post(`${API_URL}/${id}/fulfill`);
    return data?.data || data;
  },
  cancelEntry: async (id: string): Promise<WaitlistEntry> => {
    const { data } = await apiClient.post(`${API_URL}/${id}/cancel`);
    return data?.data || data;
  }
};
