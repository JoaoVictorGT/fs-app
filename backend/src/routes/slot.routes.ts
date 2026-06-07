import { Router } from 'express';
import { SlotController } from '../controllers/slot.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new SlotController();

/**
 * @openapi
 * /slots:
 *   get:
 *     tags: [Slots]
 *     summary: Lista slots disponíveis
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, full, cancelled] }
 *     responses:
 *       200:
 *         description: Lista de slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slot'
 *   post:
 *     tags: [Slots]
 *     summary: Cria um novo slot (professor)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, startTime, endTime, capacity]
 *             properties:
 *               date:        { type: string, format: date }
 *               startTime:   { type: string }
 *               endTime:     { type: string }
 *               capacity:    { type: integer }
 *               type:        { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Slot criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 */
router.get('/', authMiddleware, ctrl.getSlots.bind(ctrl));
router.post('/', authMiddleware, requireRole('teacher'), ctrl.create.bind(ctrl));

/**
 * @openapi
 * /slots/{id}:
 *   get:
 *     tags: [Slots]
 *     summary: Retorna um slot pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dados do slot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 *       404:
 *         description: Slot não encontrado
 *   patch:
 *     tags: [Slots]
 *     summary: Atualiza um slot (professor)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               capacity:    { type: integer }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Slot atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 *   delete:
 *     tags: [Slots]
 *     summary: Remove um slot (professor)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Slot removido
 *
 * /slots/{id}/cancel:
 *   patch:
 *     tags: [Slots]
 *     summary: Cancela um slot (professor)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Slot cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 */
router.get('/:id', authMiddleware, ctrl.getById.bind(ctrl));
router.patch('/:id', authMiddleware, requireRole('teacher'), ctrl.update.bind(ctrl));
router.patch('/:id/cancel', authMiddleware, requireRole('teacher'), ctrl.cancel.bind(ctrl));
router.delete('/:id', authMiddleware, requireRole('teacher'), ctrl.delete.bind(ctrl));

export default router;
