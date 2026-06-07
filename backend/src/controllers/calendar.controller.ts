import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';

const service = new BookingService();

export class CalendarController {
  async addGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await service.addCalendarEvent(req.params.id, req.user!.profileId, 'google');
      res.json(booking);
    } catch (err) { next(err); }
  }

  async removeGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await service.removeCalendarEvent(req.params.id, req.user!.profileId, 'google');
      res.json(booking);
    } catch (err) { next(err); }
  }

  async addOutlook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await service.addCalendarEvent(req.params.id, req.user!.profileId, 'outlook');
      res.json(booking);
    } catch (err) { next(err); }
  }

  async removeOutlook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await service.removeCalendarEvent(req.params.id, req.user!.profileId, 'outlook');
      res.json(booking);
    } catch (err) { next(err); }
  }
}
