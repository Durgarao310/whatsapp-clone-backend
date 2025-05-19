import { Router, Request, Response, NextFunction } from 'express';
import { addContact, removeContact, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests, getFullUserProfile } from '../controllers/contact.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { addContactValidation, removeContactValidation, sendFriendRequestValidation, acceptFriendRequestValidation, rejectFriendRequestValidation } from '../validation/contactValidation';
import { handleValidationMiddleware } from '../helpers/validation';

const router = Router();

router.post('/add', authMiddleware, addContactValidation, handleValidationMiddleware, addContact);
router.post('/remove', authMiddleware, removeContactValidation, handleValidationMiddleware, removeContact);
router.post('/request', authMiddleware, sendFriendRequestValidation, handleValidationMiddleware, sendFriendRequest);
router.post('/accept', authMiddleware, acceptFriendRequestValidation, handleValidationMiddleware, acceptFriendRequest);
router.post('/reject', authMiddleware, rejectFriendRequestValidation, handleValidationMiddleware, rejectFriendRequest);
router.get('/requests', authMiddleware, handleValidationMiddleware, getFriendRequests);
router.get('/profile', authMiddleware, handleValidationMiddleware, getFullUserProfile);

export default router;
