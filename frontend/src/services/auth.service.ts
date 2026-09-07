import apiClient from './api-client';
import { AuthTokens, LoginCredentials, User } from '@/types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },

  refreshToken: async (token: string): Promise<AuthTokens> => {
    const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken: token });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/api/v1/auth/profile');
    return response.data;
  }
};
