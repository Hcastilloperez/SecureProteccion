import api from '@/config/axios';
import { IncidentAttachment } from '@/types';

export const uploadService = {
  uploadIncidentFiles: async (incidentId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<{ success: boolean; data: IncidentAttachment[] }>(
      `/incidents/${incidentId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getAttachments: async (incidentId: string) => {
    const response = await api.get<{ success: boolean; data: IncidentAttachment[] }>(
      `/incidents/${incidentId}/attachments`
    );
    return response.data;
  },

  deleteAttachment: async (attachmentId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/attachments/${attachmentId}`
    );
    return response.data;
  },
};