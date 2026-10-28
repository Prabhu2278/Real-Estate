import api, { tokenStorage } from './api';
import { User } from '../types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'customer' | 'owner';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authService = {
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', params);
    if (res.data.access_token) {
      tokenStorage.setToken(res.data.access_token);
    }
    return res.data;
  },

  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', params);
    if (res.data.access_token) {
      tokenStorage.setToken(res.data.access_token);
    }
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: { full_name?: string; phone?: string; avatar_url?: string }): Promise<User> => {
    const res = await api.put<User>('/auth/profile', data);
    return res.data;
  },

  changePassword: async (old_password: string, new_password: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/change-password', {
      old_password,
      new_password,
    });
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout network errors
    } finally {
      tokenStorage.clearToken();
    }
  },
};
