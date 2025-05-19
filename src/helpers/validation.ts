// filepath: src/helpers/validation.ts
import { validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import httpStatus from 'http-status';

export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Validation error', errors: errors.array() });
  }
  next();
}
