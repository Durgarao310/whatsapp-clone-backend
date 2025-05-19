import { Router } from 'express';
import { getContacts } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getContacts);

export default router;
