import axios from 'axios';
import { Appointment, AppointmentFilter, CreateAppointmentDto, UpdateAppointmentDto, TimeSlot } from '@/types/appointment';

const API_URL = '/api/appointments';

export const appointmentService = {
  getAppointments: async (filter?: AppointmentFilter): Promise<Appointment[]> => {
    const { data } = await axios.get(API_URL, { params: filter });
    return data;
  },
  getAppointment: async (id: string): Promise<Appointment> => {
    const { data } = await axios.get(`${API_URL}/${id}`);
    return data;
  },
  createAppointment: async (dto: CreateAppointmentDto): Promise<Appointment> => {
    const { data } = await axios.post(API_URL, dto);
    return data;
  },
  updateAppointment: async (id: string, dto: UpdateAppointmentDto): Promise<Appointment> => {
    const { data } = await axios.patch(`${API_URL}/${id}`, dto);
    return data;
  },
  checkIn: async (id: string): Promise<Appointment> => {
    const { data } = await axios.post(`${API_URL}/${id}/check-in`);
    return data;
  },
  startConsultation: async (id: string): Promise<Appointment> => {
    const { data } = await axios.post(`${API_URL}/${id}/start`);
    return data;
  },
  completeConsultation: async (id: string): Promise<Appointment> => {
    const { data } = await axios.post(`${API_URL}/${id}/complete`);
    return data;
  },
  cancel: async (id: string, reason: string): Promise<Appointment> => {
    const { data } = await axios.post(`${API_URL}/${id}/cancel`, { reason });
    return data;
  },
  markNoShow: async (id: string): Promise<Appointment> => {
    const { data } = await axios.post(`${API_URL}/${id}/no-show`);
    return data;
  },
  getTodaysAppointments: async (doctorId: string): Promise<Appointment[]> => {
    const { data } = await axios.get(`${API_URL}/today/${doctorId}`);
    return data;
  },
  getAvailableSlots: async (doctorId: string, date: string): Promise<TimeSlot[]> => {
    const { data } = await axios.get(`${API_URL}/slots/${doctorId}/${date}`);
    return data;
  }
};
