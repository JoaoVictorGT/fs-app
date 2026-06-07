import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';
import { JwtPayload, UserRole } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifica o Firebase ID Token e carrega o perfil do usuário a partir do Firestore.
 * Requer que o documento users/{uid} exista (fluxo pós-registro).
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await auth.verifyIdToken(token);

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      res.status(401).json({ error: 'Perfil do usuário não encontrado. Contate o administrador.' });
      return;
    }

    const data = userDoc.data()!;
    req.user = {
      userId:    decoded.uid,
      email:     decoded.email ?? data.email ?? '',
      role:      data.role as UserRole,
      name:      data.name,
      profileId: decoded.uid,
      teacherId: data.teacherId ?? undefined,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso não autorizado' });
      return;
    }
    next();
  };
}
