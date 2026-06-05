import api from './api';
import { Teacher, Student } from '../models';

export const teacherService = {
  async getAll(): Promise<Teacher[]> {
    const { data } = await api.get<Teacher[]>('/teachers');
    return data;
  },

  async getById(id: string): Promise<Teacher> {
    const { data } = await api.get<Teacher>(`/teachers/${id}`);
    return data;
  },

  async getStudents(teacherId: string): Promise<Student[]> {
    const { data } = await api.get<Student[]>(`/students/by-teacher/${teacherId}`);
    return data;
  },
};
