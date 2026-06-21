import api from '@/config/axios';
import { AIConfiguration, PaginatedResponse } from '@/types';
import { AIConfigurationFormData } from '@/lib/schemas';

export interface OllamaModel {
  name: string;
  model: string;
  size?: number;
  modifiedAt?: string;
}

export const aiConfigurationService = {
  getAll: async (installationId?: string) => {
    const response = await api.get<PaginatedResponse<AIConfiguration>>('/ai/configurations', {
      params: installationId ? { installationId } : {},
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: AIConfiguration }>(
      `/ai/configurations/${id}`
    );
    return response.data;
  },

  create: async (data: AIConfigurationFormData & { installationId?: string }) => {
    const response = await api.post<{ success: boolean; data: AIConfiguration }>(
      '/ai/configurations',
      data
    );
    return response.data;
  },

  update: async (id: string, data: Partial<AIConfigurationFormData>) => {
    const response = await api.put<{ success: boolean; data: AIConfiguration }>(
      `/ai/configurations/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/ai/configurations/${id}`
    );
    return response.data;
  },

  test: async (id: string) => {
    const response = await api.post<{ success: boolean; data: { response: string } }>(
      `/ai/configurations/${id}/test`
    );
    return response.data;
  },

  getAvailableModels: async (baseUrl?: string) => {
    const response = await api.get<{ success: boolean; data: OllamaModel[] }>('/ai/models', {
      params: baseUrl ? { baseUrl } : {},
    });
    return response.data;
  },

  setDefaultModel: async (model: string, baseUrl?: string) => {
    const response = await api.post<{ success: boolean; message: string }>('/ai/set-default-model', {
      model,
      baseUrl,
    });
    return response.data;
  },

  getDefaultConfig: async () => {
    const response = await api.get<{ success: boolean; data: { model: string; baseUrl: string } }>(
      '/ai/default-config'
    );
    return response.data;
  },
};