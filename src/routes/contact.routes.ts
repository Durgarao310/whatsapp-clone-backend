import { Router, Request, Response, NextFunction } from 'express';
import { addContact, removeContact } from '../controllers/contact.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { addContactValidation, removeContactValidation } from '../validation/contactValidation';
import { handleValidationMiddleware } from '../helpers/validation';

const router = Router();

router.post('/add', authMiddleware, addContactValidation, handleValidationMiddleware, addContact);
router.post('/remove', authMiddleware, removeContactValidation, handleValidationMiddleware, removeContact);

export default router;
