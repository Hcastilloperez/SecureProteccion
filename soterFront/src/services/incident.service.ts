import api from '@/config/axios';
import { Incident, IncidentTimeline, PaginatedResponse } from '@/types';

export interface IncidentQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  incidentTypeId?: string;
  installationId?: string;
  priority?: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  incidentTypeId: string;
  installationId: string;
  priority?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  reportedBy: string;
}

export interface AddTimelineRequest {
  comment: string;
  isInternal?: boolean;
}

export interface CloseIncidentRequest {
  finalReport: string;
}

export interface EscalateIncidentRequest {
  assignedToId: string;
  comment?: string;
  escalateTo?: 'COORDINADOR' | 'GERENTE';
}

export interface VerifyIncidentRequest {
  isValid: boolean;
  comment?: string;
}

export const incidentService = {
  getAll: async (query?: IncidentQuery) => {
    const response = await api.get<PaginatedResponse<Incident>>('/incidents', {
      params: query,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Incident }>(`/incidents/${id}`);
    return response.data;
  },

  create: async (data: CreateIncidentRequest) => {
    const response = await api.post<{ success: boolean; data: Incident }>('/incidents', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateIncidentRequest>) => {
    const response = await api.put<{ success: boolean; data: Incident }>(`/incidents/${id}`, data);
    return response.data;
  },

  addTimeline: async (id: string, data: AddTimelineRequest) => {
    const response = await api.post<{ success: boolean; data: IncidentTimeline }>(
      `/incidents/${id}/timeline`,
      data
    );
    return response.data;
  },

  close: async (id: string, data: CloseIncidentRequest) => {
    const response = await api.post<{ success: boolean; data: Incident }>(
      `/incidents/${id}/close`,
      data
    );
    return response.data;
  },

  escalate: async (id: string, data: EscalateIncidentRequest) => {
    const response = await api.post<{ success: boolean; data: Incident }>(
      `/incidents/${id}/escalate`,
      data
    );
    return response.data;
  },

  verify: async (id: string, data: VerifyIncidentRequest) => {
    const response = await api.post<{ success: boolean; data: Incident }>(
      `/incidents/${id}/verify`,
      data
    );
    return response.data;
  },

  receive: async (id: string) => {
    const response = await api.post<{ success: boolean; data: Incident }>(
      `/incidents/${id}/receive`
    );
    return response.data;
  },

  getStats: async (installationId?: string) => {
    const response = await api.get<{
      success: boolean;
      data: {
        total: number;
        open: number;
        inProgress: number;
        closed: number;
        byPriority: Record<string, number>;
        byType: Record<string, number>;
      };
    }>('/incidents/stats', {
      params: { installationId },
    });
    return response.data;
  },
};