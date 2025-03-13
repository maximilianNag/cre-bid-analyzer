import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().optional(),
  ownerId: z.string().uuid('Invalid owner ID'),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  settings: z.object({
    fuzzyMatchThreshold: z.number().min(0).max(100).optional(),
    priceDeviationWarning: z.number().min(0).max(100).optional(),
    priceDeviationError: z.number().min(0).max(100).optional(),
  }).optional(),
});

export const validateProject = (req: Request, res: Response, next: NextFunction) => {
  try {
    projectSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, error.errors[0].message));
    } else {
      next(error);
    }
  }
}; 