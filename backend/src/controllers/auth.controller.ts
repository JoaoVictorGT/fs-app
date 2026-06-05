import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const service = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
        return;
      }
      const result = await service.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.json({ message: 'Logout realizado com sucesso' });
  }

  async me(req: Request, res: Response): Promise<void> {
    res.json({ user: req.user });
  }
}
