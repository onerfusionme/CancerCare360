import apiClient from './api-client';
import { Patient, PatientFilter, CreatePatientDto, UpdatePatientDto } from '@/types/patient';
import { CareJourney } from '@/types/journey';
import { PaginatedResponse, ApiResponse } from '@/types/api';

export const patientService = {
  getPatients: async (filters: PatientFilter): Promise<PaginatedResponse<Patient>> => {
    const response = await apiClient.get('/api/v1/patients', { params: filters });
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          meta: response.data.meta || { itemCount: response.data.data.length, totalItems: response.data.data.length, itemsPerPage: 10, totalPages: 1, currentPage: 1 }
        };
      }
      if (Array.isArray(response.data.data.data)) {
        return response.data.data;
      }
      return response.data.data;
    }
    return response.data || { data: [], meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 } };
  },

  getPatient: async (id: string): Promise<Patient> => {
    const response = await apiClient.get(`/api/v1/patients/${id}`);
    return response.data;
  },

  createPatient: async (data: CreatePatientDto): Promise<Patient> => {
    const response = await apiClient.post('/api/v1/patients', data);
    return response.data;
  },

  updatePatient: async (id: string, data: UpdatePatientDto): Promise<Patient> => {
    const response = await apiClient.put(`/api/v1/patients/${id}`, data);
    return response.data;
  },

  deletePatient: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/api/v1/patients/${id}`);
    return response.data;
  },

  searchPatients: async (query: string): Promise<Patient[]> => {
    const response = await apiClient.get('/api/v1/patients/search', { params: { q: query } });
    return response.data;
  },

  getPatientJourney: async (id: string): Promise<CareJourney> => {
    const response = await apiClient.get(`/api/v1/patients/${id}/journey`);
    return response.data;
  },

  getDuplicates: async (data: Partial<CreatePatientDto>): Promise<Patient[]> => {
    const response = await apiClient.get('/api/v1/patients/duplicates', { params: data });
    return response.data;
  }
};
