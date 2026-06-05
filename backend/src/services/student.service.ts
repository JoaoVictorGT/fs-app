import { v4 as uuid } from 'uuid';
import { StudentRepository } from '../repositories/student.repository';
import { Student, CreateStudentDTO, UpdateStudentDTO } from '../models/student.model';
import { mockAuthUsers } from '../data/mockData';
import { AuthUser } from '../models/user.model';

const repo = new StudentRepository();

export class StudentService {
  async getById(id: string): Promise<Student> {
    const student = await repo.findById(id);
    if (!student) throw { status: 404, message: 'Aluno não encontrado' };
    return student;
  }

  async getByTeacher(teacherId: string): Promise<Student[]> {
    return repo.findAll({ teacherId });
  }

  async register(data: CreateStudentDTO): Promise<{ student: Student; authUser: AuthUser }> {
    const existing = await repo.findByEmail(data.email);
    if (existing) throw { status: 409, message: 'E-mail já cadastrado' };

    const student = await repo.create(data);

    // Create a matching auth user in memory (replace with Firebase Auth when available)
    const authUser: AuthUser = {
      id: `auth-student-${uuid()}`,
      email: data.email,
      password: 'student123', // temporary default — should be set by user
      role: 'student',
      name: data.name,
      profileId: student.id,
      teacherId: data.teacherId,
    };
    mockAuthUsers.push(authUser);

    return { student, authUser };
  }

  async update(id: string, data: UpdateStudentDTO): Promise<Student> {
    const updated = await repo.update(id, data);
    if (!updated) throw { status: 404, message: 'Aluno não encontrado' };
    return updated;
  }
}
