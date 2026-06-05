import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new AuthController();

router.post('/login', ctrl.login.bind(ctrl));
router.post('/logout', authMiddleware, ctrl.logout.bind(ctrl));
router.get('/me', authMiddleware, ctrl.me.bind(ctrl));

export default router;
