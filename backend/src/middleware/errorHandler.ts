import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

export function errorHandler(
  err: Error & { code?: string; status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ event: 'unhandled_error', message: err.message, code: err.code });

  if (err.code === 'LLM_TIMEOUT') {
    res.status(504).json({ error: 'LLM timeout', code: 'LLM_TIMEOUT' });
    return;
  }

  if (err.code === 'LLM_ERROR') {
    res.status(502).json({ error: 'LLM unavailable', code: 'LLM_ERROR' });
    return;
  }

  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
}
