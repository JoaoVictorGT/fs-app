import { Router } from 'express';
import authRoutes from './auth.routes';
import teacherRoutes from './teacher.routes';
import studentRoutes from './student.routes';
import slotRoutes from './slot.routes';
import bookingRoutes from './booking.routes';
import streakRoutes from './streak.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);
router.use('/students', streakRoutes); // GET /students/:id/streak

router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

export default router;
