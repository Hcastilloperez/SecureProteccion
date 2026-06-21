import api from '@/config/axios';
import { Installation, Contact, Authority, SecuritySystem, PaginatedResponse } from '@/types';

export interface InstallationQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateInstallationRequest {
  name: string;
  address: string;
  city: string;
  department: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export const installationService = {
  getAll: async (query?: InstallationQuery) => {
    const response = await api.get<PaginatedResponse<Installation>>('/installations', {
      params: query,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Installation }>(`/installations/${id}`);
    return response.data;
  },

  create: async (data: CreateInstallationRequest) => {
    const response = await api.post<{ success: boolean; data: Installation }>(
      '/installations',
      data
    );
    return response.data;
  },

  update: async (id: string, data: Partial<CreateInstallationRequest>) => {
    const response = await api.put<{ success: boolean; data: Installation }>(
      `/installations/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/installations/${id}`
    );
    return response.data;
  },

  getContacts: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Contact[] }>(
      `/installations/${id}/contacts`
    );
    return response.data;
  },

  getAuthorities: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Authority[] }>(
      `/installations/${id}/authorities`
    );
    return response.data;
  },

  getSecuritySystems: async (id: string) => {
    const response = await api.get<{ success: boolean; data: SecuritySystem[] }>(
      `/installations/${id}/security-systems`
    );
    return response.data;
  },
};