import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new TeacherController();

/**
 * @openapi
 * /teachers:
 *   get:
 *     tags: [Teachers]
 *     summary: Lista todos os professores
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de professores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 *   post:
 *     tags: [Teachers]
 *     summary: Cria um novo professor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:        { type: string }
 *               email:       { type: string, format: email }
 *               academyName: { type: string }
 *               bio:         { type: string }
 *     responses:
 *       201:
 *         description: Professor criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 */
router.get('/', ctrl.getAll.bind(ctrl));
router.post('/', authMiddleware, requireRole('teacher'), ctrl.create.bind(ctrl));

/**
 * @openapi
 * /teachers/{id}:
 *   get:
 *     tags: [Teachers]
 *     summary: Retorna um professor pelo ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dados do professor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Professor não encontrado
 *   patch:
 *     tags: [Teachers]
 *     summary: Atualiza dados do professor
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
 *               name:        { type: string }
 *               academyName: { type: string }
 *               bio:         { type: string }
 *     responses:
 *       200:
 *         description: Professor atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 */
router.get('/:id', ctrl.getById.bind(ctrl));
router.patch('/:id', authMiddleware, requireRole('teacher'), ctrl.update.bind(ctrl));

export default router;
