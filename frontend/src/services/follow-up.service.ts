import axios from 'axios';
import { FollowUpTask, CreateTaskDto, UpdateTaskDto, TaskFilter, TaskDashboardStats } from '@/types/follow-up';

const API_URL = '/api/tasks';

export const followUpService = {
  getTasks: async (filter?: TaskFilter): Promise<FollowUpTask[]> => {
    const { data } = await axios.get(API_URL, { params: filter });
    return data;
  },
  getTask: async (id: string): Promise<FollowUpTask> => {
    const { data } = await axios.get(`${API_URL}/${id}`);
    return data;
  },
  createTask: async (dto: CreateTaskDto): Promise<FollowUpTask> => {
    const { data } = await axios.post(API_URL, dto);
    return data;
  },
  updateTask: async (id: string, dto: UpdateTaskDto): Promise<FollowUpTask> => {
    const { data } = await axios.patch(`${API_URL}/${id}`, dto);
    return data;
  },
  assignTask: async (id: string, userId: string): Promise<FollowUpTask> => {
    const { data } = await axios.post(`${API_URL}/${id}/assign`, { assignedToId: userId });
    return data;
  },
  escalateTask: async (id: string): Promise<FollowUpTask> => {
    const { data } = await axios.post(`${API_URL}/${id}/escalate`);
    return data;
  },
  getMyTasks: async (): Promise<FollowUpTask[]> => {
    const { data } = await axios.get(`${API_URL}/my`);
    return data;
  },
  getOverdueTasks: async (): Promise<FollowUpTask[]> => {
    const { data } = await axios.get(`${API_URL}/overdue`);
    return data;
  },
  getDashboardStats: async (): Promise<TaskDashboardStats> => {
    const { data } = await axios.get(`${API_URL}/stats`);
    return data;
  }
};
