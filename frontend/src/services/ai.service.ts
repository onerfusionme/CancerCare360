import apiClient from './api-client';
import {
  AiConsultationSummary,
  AiExtractionResult,
  AiGapExplanation,
  AiEducationDraft,
  AiInteractionLog,
  AiGovernanceStats
} from '../types/ai';

const API_BASE = '/api/v1/ai';

export const aiService = {
  extractDocument: async (documentId: string, options?: any): Promise<AiExtractionResult> => {
    const response = await apiClient.post(`${API_BASE}/extract`, { documentId, ...options });
    return response.data?.data || response.data;
  },

  summarizeConsultation: async (patientId: string, journeyId?: string): Promise<AiConsultationSummary> => {
    const response = await apiClient.post(`${API_BASE}/summarize`, { patientId, journeyId });
    return response.data?.data || response.data;
  },

  explainCareGap: async (gapType: string, gapData: any): Promise<AiGapExplanation> => {
    const response = await apiClient.post(`${API_BASE}/explain-gap`, { gapType, gapData });
    return response.data?.data || response.data;
  },

  draftEducation: async (topic: string, language: string, keyPoints: string[]): Promise<AiEducationDraft> => {
    const response = await apiClient.post(`${API_BASE}/draft-education`, { topic, language, keyPoints });
    return response.data?.data || response.data;
  },

  getLogs: async (filter?: any): Promise<AiInteractionLog[]> => {
    const response = await apiClient.get(`${API_BASE}/logs`, { params: filter });
    const raw = response.data?.data || response.data;
    return Array.isArray(raw) ? raw : (raw?.items || []);
  },

  getGovernanceStats: async (): Promise<AiGovernanceStats> => {
    const response = await apiClient.get(`${API_BASE}/governance-stats`);
    return response.data?.data || response.data;
  },

  reviewInteraction: async (id: string, reviewStatus: string, reviewNotes?: string): Promise<void> => {
    await apiClient.post(`${API_BASE}/logs/${id}/review`, { reviewStatus, reviewNotes });
  }
};
