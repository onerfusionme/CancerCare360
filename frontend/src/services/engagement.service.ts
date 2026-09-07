import axios from 'axios';
import { Campaign, EducationContent, PatientPreferences, ConsentArtefact } from '../types/engagement';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

export const engagementService = {
  // Education
  getArticles: async (): Promise<EducationContent[]> => {
    const { data } = await api.get('/education/articles');
    return data;
  },
  getArticle: async (id: string): Promise<EducationContent> => {
    const { data } = await api.get(`/education/articles/${id}`);
    return data;
  },
  createArticle: async (dto: Partial<EducationContent>): Promise<EducationContent> => {
    const { data } = await api.post('/education/articles', dto);
    return data;
  },
  updateArticle: async (id: string, dto: Partial<EducationContent>): Promise<EducationContent> => {
    const { data } = await api.put(`/education/articles/${id}`, dto);
    return data;
  },
  publishArticle: async (id: string): Promise<EducationContent> => {
    const { data } = await api.post(`/education/articles/${id}/publish`);
    return data;
  },
  archiveArticle: async (id: string): Promise<EducationContent> => {
    const { data } = await api.post(`/education/articles/${id}/archive`);
    return data;
  },

  // Campaigns
  getCampaigns: async (): Promise<Campaign[]> => {
    const { data } = await api.get('/campaigns');
    return data;
  },
  getCampaign: async (id: string): Promise<Campaign> => {
    const { data } = await api.get(`/campaigns/${id}`);
    return data;
  },
  createCampaign: async (dto: Partial<Campaign>): Promise<Campaign> => {
    const { data } = await api.post('/campaigns', dto);
    return data;
  },
  executeCampaign: async (id: string): Promise<Campaign> => {
    const { data } = await api.post(`/campaigns/${id}/execute`);
    return data;
  },
  getCampaignStats: async (id: string) => {
    const { data } = await api.get(`/campaigns/${id}/stats`);
    return data;
  },

  // Patient Portal
  getPortalProfile: async () => {
    const { data } = await api.get('/portal/profile');
    return data;
  },
  updatePreferences: async (dto: Partial<PatientPreferences>) => {
    const { data } = await api.put('/portal/preferences', dto);
    return data;
  },
  getPortalAppointments: async () => {
    const { data } = await api.get('/portal/appointments');
    return data;
  },
  getPortalTimeline: async () => {
    const { data } = await api.get('/portal/timeline');
    return data;
  },
  getPortalDocuments: async () => {
    const { data } = await api.get('/portal/documents');
    return data;
  },
  getPortalEducation: async (lang?: string): Promise<EducationContent[]> => {
    const { data } = await api.get('/portal/education', { params: { lang } });
    return data;
  },
  recordConsent: async (dto: Partial<ConsentArtefact>) => {
    const { data } = await api.post('/portal/consent', dto);
    return data;
  },
  revokeConsent: async () => {
    const { data } = await api.post('/portal/consent/revoke');
    return data;
  }
};
