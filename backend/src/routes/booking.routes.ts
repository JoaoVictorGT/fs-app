import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { CalendarController } from '../controllers/calendar.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new BookingController();
const calCtrl = new CalendarController();

router.get('/my', authMiddleware, requireRole('student'), ctrl.getMyBookings.bind(ctrl));
router.get('/by-teacher', authMiddleware, requireRole('teacher'), ctrl.getByTeacher.bind(ctrl));
router.get('/by-slot/:slotId', authMiddleware, requireRole('teacher'), ctrl.getBySlot.bind(ctrl));
router.post('/', authMiddleware, requireRole('student'), ctrl.create.bind(ctrl));
router.delete('/:id', authMiddleware, requireRole('student'), ctrl.cancel.bind(ctrl));
router.patch('/:id/confirm-attendance', authMiddleware, requireRole('teacher'), ctrl.confirmAttendance.bind(ctrl));

// Calendar integration
router.post('/:id/calendar/google', authMiddleware, requireRole('student'), calCtrl.addGoogle.bind(calCtrl));
router.delete('/:id/calendar/google', authMiddleware, requireRole('student'), calCtrl.removeGoogle.bind(calCtrl));
router.post('/:id/calendar/outlook', authMiddleware, requireRole('student'), calCtrl.addOutlook.bind(calCtrl));
router.delete('/:id/calendar/outlook', authMiddleware, requireRole('student'), calCtrl.removeOutlook.bind(calCtrl));

export default router;
