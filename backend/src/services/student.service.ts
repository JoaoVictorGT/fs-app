import { FirestoreStudentRepository } from '../repositories/firestore/student.repository';
import { Student, CreateStudentDTO, UpdateStudentDTO } from '../models/student.model';
import { auth } from '../config/firebase';

const repo = new FirestoreStudentRepository();

export class StudentService {
  async getById(id: string): Promise<Student> {
    const student = await repo.findById(id);
    if (!student) throw { status: 404, message: 'Aluno não encontrado' };
    return student;
  }

  async getByTeacher(teacherId: string): Promise<Student[]> {
    return repo.findAll({ teacherId });
  }

  /**
   * Registra um novo aluno de grupo:
   * 1. Cria usuário no Firebase Authentication (com a senha fornecida).
   * 2. Cria o documento em Firestore (users/{uid}).
   *
   * O frontend deve usar signInWithEmailAndPassword após o cadastro.
   */
  async register(data: CreateStudentDTO & { password: string }): Promise<Student> {
    // 1. Criar usuário no Firebase Auth via Admin SDK
    let uid: string;
    try {
      const userRecord = await auth.createUser({
        email:       data.email,
        password:    data.password,
        displayName: data.name,
      });
      uid = userRecord.uid;
    } catch (err: any) {
      if (err.code === 'auth/email-already-exists') {
        throw { status: 409, message: 'E-mail já cadastrado' };
      }
      if (err.code === 'auth/weak-password') {
        throw { status: 400, message: 'Senha muito fraca. Use no mínimo 6 caracteres.' };
      }
      throw { status: 500, message: 'Erro ao criar usuário. Tente novamente.' };
    }

    // 2. Criar documento no Firestore
    try {
      const { password: _, ...profileData } = data;
      const student = await repo.create(uid, profileData);
      return student;
    } catch (err) {
      // Rollback: remover usuário do Firebase Auth para evitar conta órfã
      await auth.deleteUser(uid).catch(() => {});
      throw err;
    }
  }

  async update(id: string, data: UpdateStudentDTO): Promise<Student> {
    const updated = await repo.update(id, data);
    if (!updated) throw { status: 404, message: 'Aluno não encontrado' };
    return updated;
  }
}
