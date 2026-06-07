import api from './api';
import { Streak } from '../models';

export const streakService = {
  async getByStudentId(studentId: string): Promise<Streak> {
    const { data } = await api.get<Streak>(`/students/${studentId}/streak`);
    return data;
  },
};
