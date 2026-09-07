import axios from 'axios';
import { OutreachLog, CreateOutreachDto, ContactSummary } from '@/types/outreach';

const API_URL = '/api/outreach';

export const outreachService = {
  logOutreach: async (dto: CreateOutreachDto): Promise<OutreachLog> => {
    const { data } = await axios.post(API_URL, dto);
    return data;
  },
  getTaskOutreach: async (taskId: string): Promise<OutreachLog[]> => {
    const { data } = await axios.get(`${API_URL}/task/${taskId}`);
    return data;
  },
  getPatientOutreach: async (patientId: string): Promise<OutreachLog[]> => {
    const { data } = await axios.get(`${API_URL}/patient/${patientId}`);
    return data;
  },
  getContactSummary: async (patientId: string): Promise<ContactSummary> => {
    const { data } = await axios.get(`${API_URL}/patient/${patientId}/summary`);
    return data;
  }
};
