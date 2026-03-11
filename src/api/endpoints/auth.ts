import {api} from '@/api/client';
import type {AuthResponse} from '@/types/api';

export const authApi = {
  login: async (shortName: string, appPwd: string): Promise<AuthResponse> => {
    const {data} = await api.post<AuthResponse>('/api/auth/login', {
      shortName,
      appPwd,
    });
    return data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const {data} = await api.post<AuthResponse>('/api/auth/refresh', {
      refreshToken,
    });
    return data;
  },
};
