import { Request, Response, NextFunction } from 'express';
import { SlotService } from '../services/slot.service';

const service = new SlotService();

export class SlotController {
  async getSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherId, date } = req.query as { teacherId?: string; date?: string };
      const slots = await service.getSlots({ teacherId, date });
      res.json(slots);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slot = await service.getById(req.params.id);
      res.json(slot);
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.profileId;
      const slot = await service.create(teacherId, req.body);
      res.status(201).json(slot);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slot = await service.update(req.params.id, req.user!.profileId, req.body);
      res.json(slot);
    } catch (err) { next(err); }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slot = await service.cancel(req.params.id, req.user!.profileId);
      res.json(slot);
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.delete(req.params.id, req.user!.profileId);
      res.status(204).send();
    } catch (err) { next(err); }
  }
}
