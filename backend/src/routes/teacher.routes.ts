import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new TeacherController();

// Público: listagem de professores usada na página de cadastro de alunos
router.get('/', ctrl.getAll.bind(ctrl));
router.get('/:id', ctrl.getById.bind(ctrl));
router.post('/', authMiddleware, requireRole('teacher'), ctrl.create.bind(ctrl));
router.patch('/:id', authMiddleware, requireRole('teacher'), ctrl.update.bind(ctrl));

export default router;
