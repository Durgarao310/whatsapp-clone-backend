import { Router } from 'express';
import { getCallHistory } from '../controllers/call.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AuthedRequest } from '../types';

const router = Router();

router.get('/', authMiddleware, (req, res) => getCallHistory(req as AuthedRequest, res));

export default router;
