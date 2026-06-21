import api from '@/config/axios';
import { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  lastName: string;
  phone?: string;
  role: string;
  installationId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      data
    );
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      data
    );
    return response.data;
  },

  profile: async () => {
    const response = await api.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/change-password',
      data
    );
    return response.data;
  },
};