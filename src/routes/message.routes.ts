import { Router, Request, Response, NextFunction } from 'express';
import { getMessages } from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AuthedRequest } from '../types';
import { handleValidation } from '../helpers/validation';
import { withUserIdQueryValidation } from '../validation/messageQueryValidation';

const router = Router();

router.get(
  '/',
  authMiddleware,
  withUserIdQueryValidation,
  function(req: Request, res: Response, next: NextFunction) { handleValidation(req, res, next); },
  (req: any, res: any) => getMessages(req as AuthedRequest, res)
);

export default router;
