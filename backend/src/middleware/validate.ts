import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const draftRequestSchema = z.object({
  customerMessage: z.string().min(10).max(2000),
});

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: result.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
