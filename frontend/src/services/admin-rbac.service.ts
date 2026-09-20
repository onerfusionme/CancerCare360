import apiClient from './api-client';

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  departmentId?: string;
  department?: { id: string; name: string; type?: string };
  roles: string[];
  permissions: string[];
  userRoles?: Array<{
    id: string;
    roleId: string;
    role: { id: string; name: string; description?: string; isSystem: boolean };
  }>;
  createdAt: string;
}

export interface CreateStaffUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  departmentId?: string;
  roleIds: string[];
  password?: string;
  sendEmail?: boolean;
}

export interface SystemResource {
  resource: string;
  label: string;
}

export interface SystemAction {
  action: string;
  label: string;
}

export interface RoleData {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
  detailedPermissions?: Array<{
    id: string;
    resource: string;
    action: string;
    description?: string;
  }>;
  createdAt: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: string[];
}

export const adminRbacService = {
  // Users
  getUsers: async (params?: { page?: number; limit?: number; search?: string; roleId?: string; departmentId?: string }) => {
    const res = await apiClient.get('/api/v1/users', { params });
    return res.data?.data || res.data;
  },

  createUser: async (payload: CreateStaffUserPayload) => {
    const res = await apiClient.post('/api/v1/users', payload);
    return res.data;
  },

  updateUser: async (id: string, payload: Partial<CreateStaffUserPayload>) => {
    const res = await apiClient.patch(`/api/v1/users/${id}`, payload);
    return res.data;
  },

  resendCredentials: async (userId: string) => {
    const res = await apiClient.post(`/api/v1/users/${userId}/resend-credentials`);
    return res.data;
  },

  toggleUserStatus: async (userId: string, status: 'ACTIVE' | 'INACTIVE' | 'LOCKED') => {
    const res = await apiClient.patch(`/api/v1/users/${userId}/status`, { status });
    return res.data;
  },

  // Roles & Permissions
  getRoles: async (): Promise<RoleData[]> => {
    const res = await apiClient.get('/api/v1/roles');
    return res.data?.data || res.data;
  },

  getRoleById: async (id: string): Promise<RoleData> => {
    const res = await apiClient.get(`/api/v1/roles/${id}`);
    return res.data?.data || res.data;
  },

  createRole: async (payload: CreateRolePayload) => {
    const res = await apiClient.post('/api/v1/roles', payload);
    return res.data;
  },

  updateRole: async (id: string, payload: Partial<CreateRolePayload>) => {
    const res = await apiClient.patch(`/api/v1/roles/${id}`, payload);
    return res.data;
  },

  deleteRole: async (id: string) => {
    const res = await apiClient.delete(`/api/v1/roles/${id}`);
    return res.data;
  },

  getPermissionsCatalog: async (): Promise<{
    resources: SystemResource[];
    actions: SystemAction[];
    permissions: any[];
  }> => {
    const res = await apiClient.get('/api/v1/roles/permissions');
    return res.data?.data || res.data;
  },
};
