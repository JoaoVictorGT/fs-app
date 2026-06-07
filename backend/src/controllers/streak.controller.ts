import { Request, Response, NextFunction } from 'express';
import { StreakService } from '../services/streak.service';

const service = new StreakService();

export class StreakController {
  async getByStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: studentId } = req.params;

      // Allow students to only access their own streak
      if (req.user?.role === 'student' && req.user.profileId !== studentId) {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      const streak = await service.getByStudentId(studentId);
      const now = new Date();
      const monthlyWeeks = service.getMonthlyWeeks(streak, now.getFullYear(), now.getMonth() + 1);

      res.json({ ...streak, monthlyWeeks });
    } catch (err) { next(err); }
  }
}
