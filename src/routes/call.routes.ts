import { Router } from 'express';
import { getCallHistory } from '../controllers/call.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getCallHistory);

export default router;
