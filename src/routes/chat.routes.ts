import { Router } from 'express';
import { getContacts } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AuthedRequest } from '../types';

const router = Router();

router.get('/', authMiddleware, (req, res) => getContacts(req as AuthedRequest, res));

export default router;
