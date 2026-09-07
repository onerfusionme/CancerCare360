import axios from 'axios';
import { NotificationTemplate, Notification, CreateTemplateDto, SendNotificationDto, DeliveryStats } from '@/types/notification';

const API_URL = '/api/notifications';

export const notificationService = {
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const { data } = await axios.get(`${API_URL}/templates`);
    return data;
  },
  createTemplate: async (dto: CreateTemplateDto): Promise<NotificationTemplate> => {
    const { data } = await axios.post(`${API_URL}/templates`, dto);
    return data;
  },
  updateTemplate: async (id: string, dto: Partial<CreateTemplateDto>): Promise<NotificationTemplate> => {
    const { data } = await axios.patch(`${API_URL}/templates/${id}`, dto);
    return data;
  },
  sendNotification: async (dto: SendNotificationDto): Promise<Notification> => {
    const { data } = await axios.post(`${API_URL}/send`, dto);
    return data;
  },
  sendBulk: async (dtos: SendNotificationDto[]): Promise<Notification[]> => {
    const { data } = await axios.post(`${API_URL}/send-bulk`, { notifications: dtos });
    return data;
  },
  getRecipientNotifications: async (recipientId: string): Promise<Notification[]> => {
    const { data } = await axios.get(`${API_URL}/recipient/${recipientId}`);
    return data;
  },
  getDeliveryStats: async (): Promise<DeliveryStats> => {
    const { data } = await axios.get(`${API_URL}/stats`);
    return data;
  }
};
