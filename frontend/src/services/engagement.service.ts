import apiClient from './api-client';
import { Campaign, EducationContent, PatientPreferences, ConsentArtefact } from '../types/engagement';

const api = apiClient;
const PREFIX = '/api/v1';

export const engagementService = {
  // Education
  getArticles: async (): Promise<EducationContent[]> => {
    const { data } = await api.get(`${PREFIX}/education`);
    return data?.data || data;
  },
  getArticle: async (id: string): Promise<EducationContent> => {
    const { data } = await api.get(`${PREFIX}/education/${id}`);
    return data?.data || data;
  },
  createArticle: async (dto: Partial<EducationContent>): Promise<EducationContent> => {
    const { data } = await api.post(`${PREFIX}/education`, dto);
    return data?.data || data;
  },
  updateArticle: async (id: string, dto: Partial<EducationContent>): Promise<EducationContent> => {
    const { data } = await api.patch(`${PREFIX}/education/${id}`, dto);
    return data?.data || data;
  },
  publishArticle: async (id: string): Promise<EducationContent> => {
    const { data } = await api.post(`${PREFIX}/education/${id}/publish`);
    return data?.data || data;
  },
  archiveArticle: async (id: string): Promise<EducationContent> => {
    const { data } = await api.post(`${PREFIX}/education/${id}/archive`);
    return data?.data || data;
  },
  deleteArticle: async (id: string): Promise<any> => {
    const { data } = await api.delete(`${PREFIX}/education/${id}`);
    return data?.data || data;
  },

  // Campaigns
  getCampaigns: async (): Promise<Campaign[]> => {
    const { data } = await api.get(`${PREFIX}/campaigns`);
    return data?.data || data;
  },
  getCampaign: async (id: string): Promise<Campaign> => {
    const { data } = await api.get(`${PREFIX}/campaigns/${id}`);
    return data?.data || data;
  },
  createCampaign: async (dto: Partial<Campaign>): Promise<Campaign> => {
    const { data } = await api.post(`${PREFIX}/campaigns`, dto);
    return data?.data || data;
  },
  updateCampaign: async (id: string, dto: Partial<Campaign>): Promise<Campaign> => {
    const { data } = await api.put(`${PREFIX}/campaigns/${id}`, dto);
    return data?.data || data;
  },
  deleteCampaign: async (id: string): Promise<any> => {
    const { data } = await api.delete(`${PREFIX}/campaigns/${id}`);
    return data?.data || data;
  },
  executeCampaign: async (id: string): Promise<Campaign> => {
    const { data } = await api.post(`${PREFIX}/campaigns/${id}/execute`);
    return data?.data || data;
  },
  getCampaignStats: async (id: string) => {
    const { data } = await api.get(`${PREFIX}/campaigns/${id}/stats`);
    return data?.data || data;
  },

  // Patient Portal
  getPortalProfile: async () => {
    const { data } = await api.get(`${PREFIX}/portal/profile`);
    return data?.data || data;
  },
  updatePreferences: async (dto: Partial<PatientPreferences>) => {
    const { data } = await api.put(`${PREFIX}/portal/preferences`, dto);
    return data?.data || data;
  },
  getPortalAppointments: async () => {
    const { data } = await api.get(`${PREFIX}/portal/appointments`);
    return data?.data || data;
  },
  getPortalTimeline: async () => {
    const { data } = await api.get(`${PREFIX}/portal/timeline`);
    return data?.data || data;
  },
  getPortalDocuments: async () => {
    const { data } = await api.get(`${PREFIX}/portal/documents`);
    return data?.data || data;
  },
  getPortalEducation: async (lang?: string): Promise<EducationContent[]> => {
    const { data } = await api.get(`${PREFIX}/portal/education`, { params: { lang } });
    return data?.data || data;
  },
  recordConsent: async (dto: Partial<ConsentArtefact>) => {
    const { data } = await api.post(`${PREFIX}/portal/consent`, dto);
    return data?.data || data;
  },
  revokeConsent: async () => {
    const { data } = await api.post(`${PREFIX}/portal/consent/revoke`);
    return data?.data || data;
  }
};
