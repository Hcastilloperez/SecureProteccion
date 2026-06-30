import api from '@/config/axios';
import {
  Status,
  IncidentType,
  Configuration,
  DashboardStats,
  User,
  PaginatedResponse,
} from '@/types';

export const adminService = {
  getStatuses: async (type?: string) => {
    const response = await api.get<{ success: boolean; data: Status[] }>('/admin/statuses', {
      params: { type },
    });
    return response.data;
  },

  createStatus: async (data: Partial<Status>) => {
    const response = await api.post<{ success: boolean; data: Status }>('/admin/statuses', data);
    return response.data;
  },

  updateStatus: async (id: string, data: Partial<Status>) => {
    const response = await api.put<{ success: boolean; data: Status }>(
      `/admin/statuses/${id}`,
      data
    );
    return response.data;
  },

  deleteStatus: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/statuses/${id}`
    );
    return response.data;
  },

  getIncidentTypes: async () => {
    const response = await api.get<{ success: boolean; data: IncidentType[] }>(
      '/admin/incident-types'
    );
    return response.data;
  },

  createIncidentType: async (data: Partial<IncidentType>) => {
    const response = await api.post<{ success: boolean; data: IncidentType }>(
      '/admin/incident-types',
      data
    );
    return response.data;
  },

  updateIncidentType: async (id: string, data: Partial<IncidentType>) => {
    const response = await api.put<{ success: boolean; data: IncidentType }>(
      `/admin/incident-types/${id}`,
      data
    );
    return response.data;
  },

  deleteIncidentType: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/incident-types/${id}`
    );
    return response.data;
  },

  getConfigurations: async (category?: string) => {
    const response = await api.get<{ success: boolean; data: Configuration[] }>(
      '/admin/configurations',
      { params: { category } }
    );
    return response.data;
  },

  createConfiguration: async (data: Partial<Configuration>) => {
    const response = await api.post<{ success: boolean; data: Configuration }>(
      '/admin/configurations',
      data
    );
    return response.data;
  },

  updateConfiguration: async (id: string, data: Partial<Configuration>) => {
    const response = await api.put<{ success: boolean; data: Configuration }>(
      `/admin/configurations/${id}`,
      data
    );
    return response.data;
  },

  deleteConfiguration: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/configurations/${id}`
    );
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get<{ success: boolean; data: any[] }>('/admin/roles');
    return response.data;
  },

  createRole: async (data: { name: string; description?: string; permissions: Record<string, boolean> }) => {
    const response = await api.post<{ success: boolean; data: any }>('/admin/roles', data);
    return response.data;
  },

  updateRole: async (id: string, data: { name?: string; description?: string; permissions?: Record<string, boolean>; isActive?: boolean }) => {
    const response = await api.put<{ success: boolean; data: any }>(`/admin/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/roles/${id}`);
    return response.data;
  },

  getEquipmentTypes: async () => {
    const response = await api.get<any[]>('/admin/equipment-types');
    return response.data;
  },

  createEquipmentType: async (data: { code: string; name: string; description?: string; category?: string; systemType?: string }) => {
    const response = await api.post<{ success: boolean; data: any }>('/admin/equipment-types', data);
    return response.data;
  },

  updateEquipmentType: async (id: string, data: { name?: string; description?: string; category?: string; systemType?: string; isActive?: boolean }) => {
    const response = await api.put<{ success: boolean; data: any }>(`/admin/equipment-types/${id}`, data);
    return response.data;
  },

  deleteEquipmentType: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/equipment-types/${id}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get<{ success: boolean; data: DashboardStats }>(
      '/admin/dashboard/stats'
    );
    return response.data;
  },

  getUsers: async (query?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params: query });
    return response.data;
  },

  createUser: async (data: Partial<User> & { password: string }) => {
    const response = await api.post<{ success: boolean; data: User }>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put<{ success: boolean; data: User }>(`/users/${id}`, data);
    return response.data;
  },

  updateUserPassword: async (id: string, password: string) => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/users/${id}/password`,
      { password }
    );
    return response.data;
  },

  getPermissionDefinitions: async () => {
    const response = await api.get<{ success: boolean; data: any[] }>('/admin/permissions');
    return response.data;
  },

  createPermissionDefinition: async (data: { key: string; label: string; description?: string }) => {
    const response = await api.post<{ success: boolean; data: any }>('/admin/permissions', data);
    return response.data;
  },

  deletePermissionDefinition: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/permissions/${id}`);
    return response.data;
  },
};