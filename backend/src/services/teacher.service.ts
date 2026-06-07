import { FirestoreTeacherRepository } from '../repositories/firestore/teacher.repository';
import { Teacher, CreateTeacherDTO, UpdateTeacherDTO } from '../models/teacher.model';

const repo = new FirestoreTeacherRepository();

export class TeacherService {
  async getAll(): Promise<Teacher[]> {
    return repo.findAll();
  }

  async getById(id: string): Promise<Teacher> {
    const teacher = await repo.findById(id);
    if (!teacher) throw { status: 404, message: 'Professor não encontrado' };
    return teacher;
  }

  async create(data: CreateTeacherDTO): Promise<Teacher> {
    return repo.create(data);
  }

  async update(id: string, data: UpdateTeacherDTO): Promise<Teacher> {
    const updated = await repo.update(id, data);
    if (!updated) throw { status: 404, message: 'Professor não encontrado' };
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await repo.delete(id);
    if (!deleted) throw { status: 404, message: 'Professor não encontrado' };
  }
}
