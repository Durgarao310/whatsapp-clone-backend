import { Router, Request, Response, NextFunction } from 'express';
import { getMessages } from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { handleValidationMiddleware } from '../helpers/validation';
import { withUserIdQueryValidation } from '../validation/messageQueryValidation';

const router = Router();

router.get(
  '/',
  authMiddleware,
  withUserIdQueryValidation,
  handleValidationMiddleware,
  getMessages
);

export default router;
