import api from '@/config/axios';
import { Authority, PaginatedResponse } from '@/types';
import { AuthorityFormData } from '@/lib/schemas';

export const authorityService = {
  getAll: async (installationId: string) => {
    const response = await api.get<{ success: boolean; data: Authority[] }>(
      `/installations/${installationId}/authorities`
    );
    return response.data;
  },

  create: async (installationId: string, data: AuthorityFormData) => {
    const response = await api.post<{ success: boolean; data: Authority }>(
      `/installations/${installationId}/authorities`,
      data
    );
    return response.data;
  },

  update: async (installationId: string, authorityId: string, data: Partial<AuthorityFormData>) => {
    const response = await api.put<{ success: boolean; data: Authority }>(
      `/installations/${installationId}/authorities/${authorityId}`,
      data
    );
    return response.data;
  },

  delete: async (installationId: string, authorityId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/installations/${installationId}/authorities/${authorityId}`
    );
    return response.data;
  },
};