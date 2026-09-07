import axios from 'axios';
import { CareGapRule, CareGap, CreateRuleDto } from '@/types/care-gap';

const API_URL = '/api/care-gaps';

export const careGapService = {
  getRules: async (): Promise<CareGapRule[]> => {
    const { data } = await axios.get(`${API_URL}/rules`);
    return data;
  },
  createRule: async (dto: CreateRuleDto): Promise<CareGapRule> => {
    const { data } = await axios.post(`${API_URL}/rules`, dto);
    return data;
  },
  updateRule: async (id: string, dto: Partial<CreateRuleDto>): Promise<CareGapRule> => {
    const { data } = await axios.patch(`${API_URL}/rules/${id}`, dto);
    return data;
  },
  toggleRule: async (id: string, isActive: boolean): Promise<CareGapRule> => {
    const { data } = await axios.patch(`${API_URL}/rules/${id}`, { isActive });
    return data;
  },
  detectGaps: async (): Promise<CareGap[]> => {
    const { data } = await axios.get(`${API_URL}/detect`);
    return data;
  },
  generateTasks: async (): Promise<void> => {
    await axios.post(`${API_URL}/generate-tasks`);
  }
};
