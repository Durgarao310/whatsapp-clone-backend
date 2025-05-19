// filepath: src/validation/messageValidation.ts
import { query } from 'express-validator';

export const getMessagesQueryValidation = [
  query('withUserId').isString().notEmpty().withMessage('withUserId is required'),
];
