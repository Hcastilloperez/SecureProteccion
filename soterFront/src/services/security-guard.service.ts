import api from '@/config/axios';
import { SecurityGuard } from '@/types';
import { SecurityGuardFormData } from '@/lib/schemas';

export const securityGuardService = {
  getAll: async (installationId: string) => {
    const response = await api.get<{ success: boolean; data: SecurityGuard[] }>(
      `/installations/${installationId}/security-guards`
    );
    return response.data;
  },

  create: async (installationId: string, data: SecurityGuardFormData) => {
    const response = await api.post<{ success: boolean; data: SecurityGuard }>(
      `/installations/${installationId}/security-guards`,
      data
    );
    return response.data;
  },

  update: async (installationId: string, guardId: string, data: Partial<SecurityGuardFormData>) => {
    const response = await api.put<{ success: boolean; data: SecurityGuard }>(
      `/installations/${installationId}/security-guards/${guardId}`,
      data
    );
    return response.data;
  },

  delete: async (installationId: string, guardId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/installations/${installationId}/security-guards/${guardId}`
    );
    return response.data;
  },
};