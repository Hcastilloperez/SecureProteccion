import api from '@/config/axios';
import { Contact } from '@/types';
import { ContactFormData } from '@/lib/schemas';

export const contactService = {
  getAll: async (installationId: string) => {
    const response = await api.get<{ success: boolean; data: Contact[] }>(
      `/installations/${installationId}/contacts`
    );
    return response.data;
  },

  create: async (installationId: string, data: ContactFormData) => {
    const response = await api.post<{ success: boolean; data: Contact }>(
      `/installations/${installationId}/contacts`,
      data
    );
    return response.data;
  },

  update: async (installationId: string, contactId: string, data: Partial<ContactFormData>) => {
    const response = await api.put<{ success: boolean; data: Contact }>(
      `/installations/${installationId}/contacts/${contactId}`,
      data
    );
    return response.data;
  },

  delete: async (installationId: string, contactId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/installations/${installationId}/contacts/${contactId}`
    );
    return response.data;
  },
};