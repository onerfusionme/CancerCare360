import apiClient from './api-client';
import { FollowUpTask, CreateTaskDto, UpdateTaskDto, TaskFilter, TaskDashboardStats, TaskPriority, TaskStatus } from '@/types/follow-up';

export const followUpService = {
  getTasks: async (filter?: TaskFilter): Promise<FollowUpTask[]> => {
    const response = await apiClient.get('/api/v1/follow-up-tasks', { params: filter });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
  },
  
  getTask: async (id: string): Promise<FollowUpTask> => {
    const response = await apiClient.get(`/api/v1/follow-up-tasks/${id}`);
    return response.data;
  },
  
  createTask: async (dto: CreateTaskDto): Promise<FollowUpTask> => {
    const response = await apiClient.post('/api/v1/follow-up-tasks', dto);
    return response.data;
  },
  
  updateTask: async (id: string, dto: UpdateTaskDto): Promise<FollowUpTask> => {
    const response = await apiClient.patch(`/api/v1/follow-up-tasks/${id}`, dto);
    return response.data;
  },
  
  deleteTask: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/api/v1/follow-up-tasks/${id}`);
    return response.data;
  },
  
  assignTask: async (id: string, userId: string): Promise<FollowUpTask> => {
    const response = await apiClient.patch(`/api/v1/follow-up-tasks/${id}/assign`, { userId });
    return response.data;
  },
  
  escalateTask: async (id: string): Promise<FollowUpTask> => {
    const response = await apiClient.patch(`/api/v1/follow-up-tasks/${id}/escalate`);
    return response.data;
  },
  
  getMyTasks: async (): Promise<FollowUpTask[]> => {
    const response = await apiClient.get('/api/v1/follow-up-tasks/my');
    return response.data;
  },
  
  getOverdueTasks: async (): Promise<FollowUpTask[]> => {
    const response = await apiClient.get('/api/v1/follow-up-tasks', { params: { overdue: true } });
    return response.data;
  },
  
  getDashboardStats: async (): Promise<TaskDashboardStats> => {
    const response = await apiClient.get('/api/v1/follow-up-tasks/stats');
    return response.data;
  }
};
