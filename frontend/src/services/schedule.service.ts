import apiClient from './api-client';
import { DoctorSchedule, CreateScheduleDto, UpdateScheduleDto } from '@/types/schedule';

const API_URL = '/api/v1/schedules';

export const scheduleService = {
  getSchedulesByDoctor: async (doctorId: string): Promise<DoctorSchedule[]> => {
    const { data } = await apiClient.get(`${API_URL}/doctor/${doctorId}`);
    const result = data?.data || data;
    return Array.isArray(result) ? result : [];
  },
  getSchedulesByDepartment: async (departmentId: string): Promise<DoctorSchedule[]> => {
    const { data } = await apiClient.get(`${API_URL}/department/${departmentId}`);
    const result = data?.data || data;
    return Array.isArray(result) ? result : [];
  },
  createSchedule: async (dto: CreateScheduleDto): Promise<DoctorSchedule> => {
    const { data } = await apiClient.post(API_URL, dto);
    return data?.data || data;
  },
  updateSchedule: async (id: string, dto: UpdateScheduleDto): Promise<DoctorSchedule> => {
    const { data } = await apiClient.patch(`${API_URL}/${id}`, dto);
    return data?.data || data;
  },
  deactivateSchedule: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_URL}/${id}`);
  }
};
