import { body } from 'express-validator';

export const addContactValidation = [
  body('contactId').isString().notEmpty().withMessage('contactId is required'),
];

export const removeContactValidation = [
  body('contactId').isString().notEmpty().withMessage('contactId is required'),
];
