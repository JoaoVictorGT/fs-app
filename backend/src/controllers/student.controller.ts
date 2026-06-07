import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';

const service = new StudentService();

export class StudentController {
  /**
   * POST /students/register
   * Registra aluno de grupo: cria Firebase Auth user + documento Firestore.
   * Não requer token (usuário ainda não tem conta).
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone, teacherId } = req.body;

      if (!name || !email || !password || !teacherId) {
        res.status(400).json({ error: 'Campos obrigatórios: name, email, password, teacherId' });
        return;
      }

      const student = await service.register({ name, email, password, phone, type: 'group', teacherId });
      res.status(201).json(student);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await service.getById(req.params.id);
      res.json(student);
    } catch (err) { next(err); }
  }

  async getByTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.params.teacherId || req.user?.profileId || '';
      const students  = await service.getByTeacher(teacherId);
      res.json(students);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.profileId !== req.params.id && req.user?.role !== 'teacher') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }
      const student = await service.update(req.params.id, req.body);
      res.json(student);
    } catch (err) { next(err); }
  }
}
