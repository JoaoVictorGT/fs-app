import { Router } from 'express';
import { StreakController } from '../controllers/streak.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new StreakController();

/**
 * @openapi
 * /students/{id}/streak:
 *   get:
 *     tags: [Streaks]
 *     summary: Retorna o streak de treino de um aluno
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Streak do aluno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Streak'
 *       404:
 *         description: Streak não encontrado
 */
router.get('/:id/streak', authMiddleware, ctrl.getByStudent.bind(ctrl));

export default router;
