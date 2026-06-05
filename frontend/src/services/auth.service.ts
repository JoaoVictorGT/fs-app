import api from './api';
import { LoginResponse } from '../models';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout').catch(() => {});
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data.user;
  },
};
