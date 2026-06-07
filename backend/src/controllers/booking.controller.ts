import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';

const service = new BookingService();

export class BookingController {
  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.profileId;
      const bookings = await service.getByStudent(studentId);
      res.json(bookings);
    } catch (err) { next(err); }
  }

  async getBySlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await service.getBySlot(req.params.slotId);
      res.json(bookings);
    } catch (err) { next(err); }
  }

  async getByTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.profileId;
      const bookings = await service.getByTeacher(teacherId);
      res.json(bookings);
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.profileId;
      const { slotId } = req.body;
      if (!slotId) {
        res.status(400).json({ error: 'slotId é obrigatório' });
        return;
      }
      const booking = await service.create(studentId, slotId);
      res.status(201).json(booking);
    } catch (err) { next(err); }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.profileId;
      const booking = await service.cancel(req.params.id, studentId);
      res.json(booking);
    } catch (err) { next(err); }
  }

  async confirmAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!.profileId;
      const booking = await service.confirmAttendance(req.params.id, teacherId);
      res.json(booking);
    } catch (err) { next(err); }
  }
}
