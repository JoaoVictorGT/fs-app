import { Router } from 'express';
import { StreakController } from '../controllers/streak.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new StreakController();

router.get('/:id/streak', authMiddleware, ctrl.getByStudent.bind(ctrl));

export default router;
