// filepath: src/validation/messageQueryValidation.ts
import { query } from 'express-validator';

export const withUserIdQueryValidation = [
  query('withUserId').isString().notEmpty().withMessage('withUserId is required'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than 0'),
];
