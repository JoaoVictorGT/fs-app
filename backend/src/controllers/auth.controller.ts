import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const service = new AuthService();

export class AuthController {
  /**
   * POST /auth/login — não existe mais no backend.
   * O login é feito no frontend com Firebase SDK (signInWithEmailAndPassword).
   * Mantido apenas para evitar breaking change; retorna mensagem orientativa.
   */
  async login(_req: Request, res: Response): Promise<void> {
    res.status(410).json({
      error: 'Este endpoint foi substituído pelo Firebase Authentication. ' +
             'Use o SDK do Firebase no frontend para fazer login.',
    });
  }

  async logout(_req: Request, res: Response): Promise<void> {
    // Firebase Auth é stateless — a invalidação do token é feita no cliente com signOut()
    res.json({ message: 'Logout realizado. Chame signOut() no Firebase SDK no cliente.' });
  }

  /**
   * GET /auth/me — verifica o token Firebase e retorna o perfil do Firestore.
   * O authMiddleware já verificou o token e populou req.user.
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ user: req.user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /auth/verify — alternativa para verificar token antes de ter req.user populado.
   */
  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
      }
      const user = await service.getProfile(token);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
}
