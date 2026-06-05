import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new TeacherController();

router.get('/', authMiddleware, ctrl.getAll.bind(ctrl));
router.get('/:id', authMiddleware, ctrl.getById.bind(ctrl));
router.post('/', authMiddleware, requireRole('teacher'), ctrl.create.bind(ctrl));
router.patch('/:id', authMiddleware, requireRole('teacher'), ctrl.update.bind(ctrl));

export default router;
