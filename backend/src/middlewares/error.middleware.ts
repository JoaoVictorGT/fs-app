import { Request, Response, NextFunction } from 'express';

interface AppError {
  status?: number;
  message?: string;
}

export function errorMiddleware(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  if (status >= 500) {
    console.error('[Error]', err);
  }

  res.status(status).json({ error: message });
}
