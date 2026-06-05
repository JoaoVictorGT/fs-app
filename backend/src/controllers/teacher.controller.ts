import { Request, Response, NextFunction } from 'express';
import { TeacherService } from '../services/teacher.service';

const service = new TeacherService();

export class TeacherController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teachers = await service.getAll();
      res.json(teachers);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await service.getById(req.params.id);
      res.json(teacher);
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await service.create(req.body);
      res.status(201).json(teacher);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await service.update(req.params.id, req.body);
      res.json(teacher);
    } catch (err) { next(err); }
  }
}
