import apiClient from './api-client';
import { Appointment, AppointmentFilter, CreateAppointmentDto, UpdateAppointmentDto, TimeSlot, AppointmentStatus } from '@/types/appointment';

export const appointmentService = {
  getAppointments: async (filter?: AppointmentFilter): Promise<Appointment[]> => {
    const response = await apiClient.get('/api/v1/appointments', { params: filter });
    // Handle paginated response format { data, meta }
    return response.data?.data || response.data || [];
  },
  
  getAppointment: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get(`/api/v1/appointments/${id}`);
    return response.data?.data || response.data;
  },
  
  createAppointment: async (dto: CreateAppointmentDto): Promise<Appointment> => {
    const response = await apiClient.post('/api/v1/appointments', dto);
    return response.data?.data || response.data;
  },
  
  updateAppointment: async (id: string, dto: UpdateAppointmentDto): Promise<Appointment> => {
    const response = await apiClient.patch(`/api/v1/appointments/${id}`, dto);
    return response.data?.data || response.data;
  },
  
  checkIn: async (id: string): Promise<Appointment> => {
    const response = await apiClient.patch(`/api/v1/appointments/${id}/check-in`);
    return response.data?.data || response.data;
  },
  
  startConsultation: async (id: string): Promise<Appointment> => {
    const response = await apiClient.patch(`/api/v1/appointments/${id}/start`);
    return response.data?.data || response.data;
  },
  
  completeConsultation: async (id: string): Promise<Appointment> => {
    const response = await apiClient.patch(`/api/v1/appointments/${id}/complete`);
    return response.data?.data || response.data;
  },
  
  cancel: async (id: string, reason: string): Promise<Appointment> => {
    const response = await apiClient.patch(`/api/v1/appointments/${id}/cancel`, { reason });
    return response.data?.data || response.data;
  },
  
  markNoShow: async (id: string): Promise<Appointment> => {
    const response = await apiClient.patch(`/api/v1/appointments/${id}/no-show`);
    return response.data?.data || response.data;
  },
  
  getTodaysAppointments: async (doctorId?: string): Promise<Appointment[]> => {
    const params: any = { date: new Date().toISOString().split('T')[0] };
    if (doctorId) params.doctorId = doctorId;
    const response = await apiClient.get('/api/v1/appointments', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },
  
  getAvailableSlots: async (doctorId: string, date: string): Promise<TimeSlot[]> => {
    const response = await apiClient.get(`/api/v1/appointments/slots`, { params: { doctorId, date } });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getNoShowRisks: async (date?: string): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/appointments/no-show-risks', { params: { date } });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  deleteAppointment: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/api/v1/appointments/${id}`);
    return response.data;
  },
};
