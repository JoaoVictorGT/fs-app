import { v4 as uuid } from 'uuid';
import { Teacher, CreateTeacherDTO, UpdateTeacherDTO } from '../models/teacher.model';
import { IRepository } from './interfaces';
import { mockTeachers } from '../data/mockData';

// NOTE: Replace with FirestoreTeacherRepository when Firebase credentials are available.
export class TeacherRepository implements IRepository<Teacher, CreateTeacherDTO, UpdateTeacherDTO> {
  private store: Map<string, Teacher>;

  constructor() {
    this.store = new Map(mockTeachers.map(t => [t.id, t]));
  }

  async findById(id: string): Promise<Teacher | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Teacher[]> {
    return Array.from(this.store.values());
  }

  async create(data: CreateTeacherDTO): Promise<Teacher> {
    const teacher: Teacher = { ...data, id: uuid(), createdAt: new Date() };
    this.store.set(teacher.id, teacher);
    return teacher;
  }

  async update(id: string, data: UpdateTeacherDTO): Promise<Teacher | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
