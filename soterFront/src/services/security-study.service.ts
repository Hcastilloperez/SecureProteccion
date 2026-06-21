import api from '@/config/axios';
import { SecurityStudy, PaginatedResponse } from '@/types';
import { SecurityStudyFormData } from '@/lib/schemas';

export interface SecurityStudyQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const securityStudyService = {
  getAll: async (installationId: string, query?: SecurityStudyQuery) => {
    const response = await api.get<PaginatedResponse<SecurityStudy>>(
      `/installations/${installationId}/security-studies`,
      { params: query }
    );
    return response.data;
  },

  getById: async (installationId: string, studyId: string) => {
    const response = await api.get<{ success: boolean; data: SecurityStudy }>(
      `/installations/${installationId}/security-studies/${studyId}`
    );
    return response.data;
  },

  create: async (installationId: string, data: SecurityStudyFormData) => {
    const response = await api.post<{ success: boolean; data: SecurityStudy }>(
      `/installations/${installationId}/security-studies`,
      data
    );
    return response.data;
  },

  update: async (installationId: string, studyId: string, data: Partial<SecurityStudyFormData>) => {
    const response = await api.put<{ success: boolean; data: SecurityStudy }>(
      `/installations/${installationId}/security-studies/${studyId}`,
      data
    );
    return response.data;
  },

  delete: async (installationId: string, studyId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/installations/${installationId}/security-studies/${studyId}`
    );
    return response.data;
  },

  generateWithAI: async (installationId: string, studyId: string) => {
    const response = await api.post<{ success: boolean; data: SecurityStudy }>(
      `/installations/${installationId}/security-studies/${studyId}/generate`
    );
    return response.data;
  },
};