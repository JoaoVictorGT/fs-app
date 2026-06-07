import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new StudentController();

/**
 * @openapi
 * /students/register:
 *   post:
 *     tags: [Students]
 *     summary: Cadastro de novo aluno
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, teacherId]
 *             properties:
 *               name:      { type: string }
 *               email:     { type: string, format: email }
 *               password:  { type: string }
 *               phone:     { type: string }
 *               teacherId: { type: string }
 *               type:      { type: string, enum: [presencial, online] }
 *     responses:
 *       201:
 *         description: Aluno criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Dados inválidos
 */
router.post('/register', ctrl.register.bind(ctrl));

/**
 * @openapi
 * /students/by-teacher/{teacherId}:
 *   get:
 *     tags: [Students]
 *     summary: Lista alunos de um professor
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de alunos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
router.get('/by-teacher/:teacherId', authMiddleware, requireRole('teacher'), ctrl.getByTeacher.bind(ctrl));

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Retorna um aluno pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dados do aluno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Aluno não encontrado
 *   patch:
 *     tags: [Students]
 *     summary: Atualiza dados do aluno
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
 *               name:  { type: string }
 *               phone: { type: string }
 *               type:  { type: string, enum: [presencial, online] }
 *     responses:
 *       200:
 *         description: Aluno atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 */
router.get('/:id', authMiddleware, ctrl.getById.bind(ctrl));
router.patch('/:id', authMiddleware, ctrl.update.bind(ctrl));

export default router;
