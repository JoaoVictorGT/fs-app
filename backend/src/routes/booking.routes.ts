import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new BookingController();

router.get('/my', authMiddleware, requireRole('student'), ctrl.getMyBookings.bind(ctrl));
router.get('/by-teacher', authMiddleware, requireRole('teacher'), ctrl.getByTeacher.bind(ctrl));
router.get('/by-slot/:slotId', authMiddleware, requireRole('teacher'), ctrl.getBySlot.bind(ctrl));
router.post('/', authMiddleware, requireRole('student'), ctrl.create.bind(ctrl));
router.delete('/:id', authMiddleware, requireRole('student'), ctrl.cancel.bind(ctrl));

export default router;
