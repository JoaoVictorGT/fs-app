import { v4 as uuid } from 'uuid';
import { Student, CreateStudentDTO, UpdateStudentDTO } from '../models/student.model';
import { IRepository } from './interfaces';
import { mockStudents } from '../data/mockData';

// NOTE: Replace with FirestoreStudentRepository when Firebase credentials are available.
export class StudentRepository implements IRepository<Student, CreateStudentDTO, UpdateStudentDTO> {
  private store: Map<string, Student>;

  constructor() {
    this.store = new Map(mockStudents.map(s => [s.id, s]));
  }

  async findById(id: string): Promise<Student | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(filter?: Partial<Student>): Promise<Student[]> {
    let result = Array.from(this.store.values());
    if (filter?.teacherId) result = result.filter(s => s.teacherId === filter.teacherId);
    if (filter?.type) result = result.filter(s => s.type === filter.type);
    return result;
  }

  async findByEmail(email: string): Promise<Student | null> {
    return Array.from(this.store.values()).find(s => s.email === email) ?? null;
  }

  async create(data: CreateStudentDTO): Promise<Student> {
    const student: Student = { ...data, id: uuid(), createdAt: new Date() };
    this.store.set(student.id, student);
    return student;
  }

  async update(id: string, data: UpdateStudentDTO): Promise<Student | null> {
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
