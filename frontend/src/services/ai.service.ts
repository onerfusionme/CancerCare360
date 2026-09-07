import axios from 'axios';
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
    const response = await axios.post(`${API_BASE}/extract`, { documentId, ...options });
    return response.data;
  },

  summarizeConsultation: async (patientId: string, journeyId?: string): Promise<AiConsultationSummary> => {
    const response = await axios.post(`${API_BASE}/summarize`, { patientId, journeyId });
    return response.data;
  },

  explainCareGap: async (gapType: string, gapData: any): Promise<AiGapExplanation> => {
    const response = await axios.post(`${API_BASE}/explain-gap`, { gapType, gapData });
    return response.data;
  },

  draftEducation: async (topic: string, language: string, keyPoints: string[]): Promise<AiEducationDraft> => {
    const response = await axios.post(`${API_BASE}/draft-education`, { topic, language, keyPoints });
    return response.data;
  },

  getLogs: async (filter?: any): Promise<AiInteractionLog[]> => {
    const response = await axios.get(`${API_BASE}/logs`, { params: filter });
    return response.data;
  },

  getGovernanceStats: async (): Promise<AiGovernanceStats> => {
    const response = await axios.get(`${API_BASE}/governance-stats`);
    return response.data;
  },

  reviewInteraction: async (id: string, reviewStatus: string, reviewNotes?: string): Promise<void> => {
    await axios.post(`${API_BASE}/logs/${id}/review`, { reviewStatus, reviewNotes });
  }
};
