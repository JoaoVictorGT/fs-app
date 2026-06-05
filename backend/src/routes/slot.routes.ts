import { Router } from 'express';
import { SlotController } from '../controllers/slot.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new SlotController();

router.get('/', authMiddleware, ctrl.getSlots.bind(ctrl));
router.get('/:id', authMiddleware, ctrl.getById.bind(ctrl));
router.post('/', authMiddleware, requireRole('teacher'), ctrl.create.bind(ctrl));
router.patch('/:id', authMiddleware, requireRole('teacher'), ctrl.update.bind(ctrl));
router.patch('/:id/cancel', authMiddleware, requireRole('teacher'), ctrl.cancel.bind(ctrl));
router.delete('/:id', authMiddleware, requireRole('teacher'), ctrl.delete.bind(ctrl));

export default router;
