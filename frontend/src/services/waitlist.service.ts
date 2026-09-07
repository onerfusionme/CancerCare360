import axios from 'axios';
import { WaitlistEntry, CreateWaitlistDto } from '@/types/waitlist';

const API_URL = '/api/waitlist';

export const waitlistService = {
  getWaitlist: async (): Promise<WaitlistEntry[]> => {
    const { data } = await axios.get(API_URL);
    return data;
  },
  createWaitlistEntry: async (dto: CreateWaitlistDto): Promise<WaitlistEntry> => {
    const { data } = await axios.post(API_URL, dto);
    return data;
  },
  fulfillEntry: async (id: string): Promise<WaitlistEntry> => {
    const { data } = await axios.post(`${API_URL}/${id}/fulfill`);
    return data;
  },
  cancelEntry: async (id: string): Promise<WaitlistEntry> => {
    const { data } = await axios.post(`${API_URL}/${id}/cancel`);
    return data;
  }
};
