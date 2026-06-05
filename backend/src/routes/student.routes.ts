import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new StudentController();

router.post('/register', ctrl.register.bind(ctrl));
router.get('/by-teacher/:teacherId', authMiddleware, requireRole('teacher'), ctrl.getByTeacher.bind(ctrl));
router.get('/:id', authMiddleware, ctrl.getById.bind(ctrl));
router.patch('/:id', authMiddleware, ctrl.update.bind(ctrl));

export default router;
