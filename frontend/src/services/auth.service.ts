import apiClient from './api-client';
import { AuthTokens, LoginCredentials, User } from '@/types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    // For demo purposes, we can mock this or use the real API
    // const response = await apiClient.post('/auth/login', credentials);
    // return response.data.data;
    
    // MOCK RESPONSE
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 'u1',
            email: credentials.email,
            firstName: 'Demo',
            lastName: 'Doctor',
            roles: [credentials.email.includes('admin') ? 'ADMIN' : 'ONCOLOGIST'] as any,
            tenantId: 't1',
            isActive: true,
          },
          tokens: {
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
          }
        });
      }, 1000);
    });
  },

  logout: async (): Promise<void> => {
    // await apiClient.post('/auth/logout');
  },

  refreshToken: async (token: string): Promise<AuthTokens> => {
    // const response = await apiClient.post('/auth/refresh', { refreshToken: token });
    // return response.data.data;
    return { accessToken: 'new_mock', refreshToken: 'new_mock_refresh' };
  },

  getProfile: async (): Promise<User> => {
    // const response = await apiClient.get('/auth/profile');
    // return response.data.data;
    return {
      id: 'u1',
      email: 'doctor@demo.com',
      firstName: 'Demo',
      lastName: 'Doctor',
      roles: ['ONCOLOGIST'] as any,
      tenantId: 't1',
      isActive: true,
    };
  }
};
