import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { CalendarController } from '../controllers/calendar.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new BookingController();
const calCtrl = new CalendarController();

/**
 * @openapi
 * /bookings/my:
 *   get:
 *     tags: [Bookings]
 *     summary: Lista agendamentos do aluno autenticado
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *
 * /bookings/by-teacher:
 *   get:
 *     tags: [Bookings]
 *     summary: Lista agendamentos do professor autenticado
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *
 * /bookings/by-slot/{slotId}:
 *   get:
 *     tags: [Bookings]
 *     summary: Lista agendamentos de um slot (professor)
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Cria um agendamento (aluno)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slotId]
 *             properties:
 *               slotId: { type: string }
 *     responses:
 *       201:
 *         description: Agendamento criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       409:
 *         description: Slot cheio ou já agendado
 *
 * /bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Cancela um agendamento (aluno)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Agendamento cancelado
 *
 * /bookings/{id}/confirm-attendance:
 *   patch:
 *     tags: [Bookings]
 *     summary: Confirma presença do aluno (professor)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Presença confirmada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *
 * /bookings/{id}/calendar/google:
 *   post:
 *     tags: [Bookings, Calendar]
 *     summary: Adiciona evento ao Google Calendar
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento adicionado
 *   delete:
 *     tags: [Bookings, Calendar]
 *     summary: Remove evento do Google Calendar
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento removido
 *
 * /bookings/{id}/calendar/outlook:
 *   post:
 *     tags: [Bookings, Calendar]
 *     summary: Adiciona evento ao Outlook Calendar
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento adicionado
 *   delete:
 *     tags: [Bookings, Calendar]
 *     summary: Remove evento do Outlook Calendar
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento removido
 */
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
