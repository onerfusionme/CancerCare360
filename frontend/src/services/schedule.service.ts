import axios from 'axios';
import { DoctorSchedule, CreateScheduleDto, UpdateScheduleDto } from '@/types/schedule';

const API_URL = '/api/schedules';

export const scheduleService = {
  getSchedulesByDoctor: async (doctorId: string): Promise<DoctorSchedule[]> => {
    const { data } = await axios.get(`${API_URL}/doctor/${doctorId}`);
    return data;
  },
  getSchedulesByDepartment: async (departmentId: string): Promise<DoctorSchedule[]> => {
    const { data } = await axios.get(`${API_URL}/department/${departmentId}`);
    return data;
  },
  createSchedule: async (dto: CreateScheduleDto): Promise<DoctorSchedule> => {
    const { data } = await axios.post(API_URL, dto);
    return data;
  },
  updateSchedule: async (id: string, dto: UpdateScheduleDto): Promise<DoctorSchedule> => {
    const { data } = await axios.patch(`${API_URL}/${id}`, dto);
    return data;
  },
  deactivateSchedule: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};
