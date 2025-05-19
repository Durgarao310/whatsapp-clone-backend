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

export const handleValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  handleValidation(req, res, next);
};

// filepath: src/helpers/queryHelpers.ts
export function getStringFromQuery(param: unknown): string | undefined {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return undefined;
}

export function getNumberFromQuery(param: unknown, defaultValue: number): number {
  const str = getStringFromQuery(param);
  if (!str) return defaultValue;
  const num = parseInt(str, 10);
  return isNaN(num) ? defaultValue : num;
}
