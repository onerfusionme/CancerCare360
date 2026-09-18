import apiClient from './api-client';
import { 
  ConsultationReadiness, 
  SinceLastVisit, 
  StatInvestigationInput, 
  FinalizeConsultationInput 
} from '@/types/consultation';

export const consultationService = {
  getConsultationReadiness: async (patientId: string): Promise<ConsultationReadiness> => {
    const res = await apiClient.get(`/api/v1/consultation-readiness/${patientId}`);
    return res.data?.data || res.data;
  },

  getSinceLastVisit: async (patientId: string): Promise<SinceLastVisit> => {
    const res = await apiClient.get(`/api/v1/consultation-readiness/${patientId}/since-last-visit`);
    return res.data?.data || res.data;
  },

  orderStatInvestigation: async (patientId: string, dto: StatInvestigationInput) => {
    const res = await apiClient.post(`/api/v1/consultation-readiness/${patientId}/stat-investigation`, dto);
    return res.data?.data || res.data;
  },

  finalizeConsultation: async (patientId: string, dto: FinalizeConsultationInput) => {
    const res = await apiClient.post(`/api/v1/consultation-readiness/${patientId}/finalize`, dto);
    return res.data?.data || res.data;
  },
};
