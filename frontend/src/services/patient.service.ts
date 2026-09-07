import apiClient from './api-client';
import { Patient, PatientFilter, CreatePatientDto, UpdatePatientDto } from '@/types/patient';
import { CareJourney } from '@/types/journey';
import { PaginatedResponse, ApiResponse } from '@/types/api';

// MOCK DATA GENERATOR
import { PatientStatus, Gender } from '@/types/patient';

const mockPatients: Patient[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `p${i + 1}`,
  mrn: `MRN${String(10000 + i).padStart(6, '0')}`,
  firstName: `Patient${i + 1}`,
  lastName: `Smith`,
  dateOfBirth: new Date(1950 + (i % 40), i % 12, (i % 28) + 1).toISOString(),
  gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
  status: i % 5 === 0 ? PatientStatus.INACTIVE : PatientStatus.ACTIVE,
  careStage: ['DIAGNOSIS', 'TREATMENT_PLANNING', 'ACTIVE_TREATMENT', 'FOLLOW_UP'][i % 4],
  primaryDoctorId: 'd1',
  primaryDoctorName: 'Dr. Sarah Jenkins',
  tenantId: 't1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastVisit: new Date(Date.now() - i * 86400000).toISOString(),
}));

export const patientService = {
  getPatients: async (filters: PatientFilter): Promise<PaginatedResponse<Patient>> => {
    // const response = await apiClient.get('/patients', { params: filters });
    // return response.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = mockPatients;
        if (filters.search) {
          const lSearch = filters.search.toLowerCase();
          filtered = filtered.filter(p => p.firstName.toLowerCase().includes(lSearch) || p.mrn.toLowerCase().includes(lSearch));
        }
        if (filters.status) {
          filtered = filtered.filter(p => p.status === filters.status);
        }
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);
        
        resolve({
          data: paginated,
          meta: {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
            itemCount: paginated.length
          }
        });
      }, 500);
    });
  },

  getPatient: async (id: string): Promise<Patient> => {
    // const response = await apiClient.get(`/patients/${id}`);
    // return response.data.data;
    return new Promise((resolve) => {
      setTimeout(() => {
        const p = mockPatients.find(p => p.id === id);
        if (p) resolve(p);
        else throw new Error("Not found");
      }, 300);
    });
  },

  createPatient: async (data: CreatePatientDto): Promise<Patient> => {
    // const response = await apiClient.post('/patients', data);
    // return response.data.data;
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPatient: Patient = {
          ...data,
          id: `p${Math.floor(Math.random() * 10000)}`,
          mrn: data.mrn || `MRN${Math.floor(Math.random() * 100000)}`,
          status: PatientStatus.ACTIVE,
          careStage: 'SCREENING',
          tenantId: 't1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newPatient);
      }, 500);
    });
  },

  updatePatient: async (id: string, data: UpdatePatientDto): Promise<Patient> => {
    // const response = await apiClient.put(`/patients/${id}`, data);
    // return response.data.data;
    return new Promise((resolve) => {
      setTimeout(() => {
        const p = mockPatients.find(p => p.id === id);
        if (p) {
          resolve({ ...p, ...data });
        } else {
          throw new Error("Not found");
        }
      }, 500);
    });
  },

  searchPatients: async (query: string): Promise<Patient[]> => {
    // const response = await apiClient.get('/patients/search', { params: { q: query } });
    // return response.data.data;
    return new Promise((resolve) => {
      setTimeout(() => {
        const lSearch = query.toLowerCase();
        const filtered = mockPatients.filter(p => p.firstName.toLowerCase().includes(lSearch) || p.mrn.toLowerCase().includes(lSearch));
        resolve(filtered.slice(0, 5));
      }, 300);
    });
  },

  getPatientJourney: async (id: string): Promise<CareJourney> => {
    // const response = await apiClient.get(`/patients/${id}/journey`);
    // return response.data.data;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          patientId: id,
          currentStage: 'ACTIVE_TREATMENT' as any,
          startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          events: [
            {
              id: 'e1',
              patientId: id,
              eventType: 'CONSULTATION' as any,
              title: 'Initial Consultation',
              date: new Date(Date.now() - 30 * 86400000).toISOString(),
              status: 'COMPLETED' as any,
              providerName: 'Dr. Smith',
              createdAt: new Date().toISOString()
            },
            {
              id: 'e2',
              patientId: id,
              eventType: 'INVESTIGATION' as any,
              title: 'PET Scan',
              date: new Date(Date.now() - 25 * 86400000).toISOString(),
              status: 'COMPLETED' as any,
              createdAt: new Date().toISOString()
            },
            {
              id: 'e3',
              patientId: id,
              eventType: 'CHEMOTHERAPY' as any,
              title: 'Cycle 1',
              date: new Date(Date.now() + 2 * 86400000).toISOString(),
              status: 'SCHEDULED' as any,
              createdAt: new Date().toISOString()
            }
          ],
          milestones: []
        });
      }, 300);
    });
  },

  getDuplicates: async (data: Partial<CreatePatientDto>): Promise<Patient[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 300);
    });
  }
};
