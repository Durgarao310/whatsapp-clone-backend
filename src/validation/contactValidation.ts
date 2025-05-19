import { body } from 'express-validator';

export const addContactValidation = [
  body('contactId').isString().notEmpty().withMessage('contactId is required'),
];

export const removeContactValidation = [
  body('contactId').isString().notEmpty().withMessage('contactId is required'),
];

export const sendFriendRequestValidation = [
  body('targetId').isString().notEmpty().withMessage('targetId is required'),
];

export const acceptFriendRequestValidation = [
  body('requesterId').isString().notEmpty().withMessage('requesterId is required'),
];

export const rejectFriendRequestValidation = [
  body('requesterId').isString().notEmpty().withMessage('requesterId is required'),
];
