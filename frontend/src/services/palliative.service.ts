import apiClient from './api-client';

export interface PalliativeClinic {
  id: string;
  name: string;
  facilityType: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  address: string;
  leadContactPerson: string;
  phone: string;
  emergencyHelpline?: string;
  email?: string;
  servicesOffered: string[];
  description?: string;
  isVerified: boolean;
  rating: number;
  operatingHours: string;
  createdAt: string;
}

export interface OnboardClinicPayload {
  name: string;
  facilityType: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  address: string;
  leadContactPerson: string;
  phone: string;
  emergencyHelpline?: string;
  email?: string;
  servicesOffered: string[];
  description?: string;
}

export interface EsasAssessmentPayload {
  patientId: string;
  physicalPain: number;
  psychologicalDistress: number;
  socialFinancialToxicity: number;
  spiritualDistress: number;
  fatigue?: number;
  shortnessOfBreath?: number;
  nausea?: number;
  appetiteLoss?: number;
  overallWellBeing?: number;
  notes?: string;
}

export interface EsasAssessmentRecord extends EsasAssessmentPayload {
  id: string;
  patientName?: string;
  totalPainScore: number;
  severityLevel: 'MILD' | 'MODERATE' | 'SEVERE';
  recommendedActions: string[];
  createdAt: string;
}

export const palliativeService = {
  getClinics: async (params?: { city?: string; service?: string; search?: string }): Promise<PalliativeClinic[]> => {
    const res = await apiClient.get('/api/v1/palliative/clinics', { params });
    return res.data?.data || res.data;
  },

  onboardClinic: async (payload: OnboardClinicPayload): Promise<PalliativeClinic> => {
    const res = await apiClient.post('/api/v1/palliative/clinics', payload);
    return res.data?.data || res.data;
  },

  updateClinic: async (id: string, payload: Partial<OnboardClinicPayload>): Promise<PalliativeClinic> => {
    const res = await apiClient.put(`/api/v1/palliative/clinics/${id}`, payload);
    return res.data?.data || res.data;
  },

  deleteClinic: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/palliative/clinics/${id}`);
  },

  getAssessments: async (patientId?: string): Promise<EsasAssessmentRecord[]> => {
    const url = patientId ? `/api/v1/palliative/assessments/${patientId}` : '/api/v1/palliative/assessments';
    const res = await apiClient.get(url);
    return res.data?.data || res.data;
  },

  submitAssessment: async (payload: EsasAssessmentPayload): Promise<EsasAssessmentRecord> => {
    const res = await apiClient.post('/api/v1/palliative/assessments', payload);
    return res.data?.data || res.data;
  },
};
