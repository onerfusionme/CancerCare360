import apiClient from './api-client';
import { NotificationTemplate, Notification, CreateTemplateDto, SendNotificationDto, DeliveryStats } from '@/types/notification';

const API_URL = '/api/v1/notifications';

export const notificationService = {
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const { data } = await apiClient.get(`${API_URL}/templates`);
    const result = data?.data || data;
    return Array.isArray(result) ? result : [];
  },
  createTemplate: async (dto: CreateTemplateDto): Promise<NotificationTemplate> => {
    const { data } = await apiClient.post(`${API_URL}/templates`, dto);
    return data?.data || data;
  },
  updateTemplate: async (id: string, dto: Partial<CreateTemplateDto>): Promise<NotificationTemplate> => {
    const { data } = await apiClient.patch(`${API_URL}/templates/${id}`, dto);
    return data?.data || data;
  },
  sendNotification: async (dto: SendNotificationDto): Promise<Notification> => {
    const { data } = await apiClient.post(`${API_URL}/send`, dto);
    return data?.data || data;
  },
  sendBulk: async (dtos: SendNotificationDto[]): Promise<Notification[]> => {
    const { data } = await apiClient.post(`${API_URL}/send-bulk`, { notifications: dtos });
    const result = data?.data || data;
    return Array.isArray(result) ? result : [];
  },
  getRecipientNotifications: async (recipientId: string): Promise<Notification[]> => {
    const { data } = await apiClient.get(`${API_URL}/recipient/${recipientId}`);
    const result = data?.data || data;
    return Array.isArray(result) ? result : [];
  },
  getDeliveryStats: async (): Promise<DeliveryStats> => {
    const { data } = await apiClient.get(`${API_URL}/stats`);
    return data?.data || data;
  }
};
