import { Router, Request, Response, NextFunction } from 'express';
import { addContact, removeContact, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests, getFullUserProfile } from '../controllers/contact.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { addContactValidation, removeContactValidation, sendFriendRequestValidation, acceptFriendRequestValidation, rejectFriendRequestValidation } from '../validation/contactValidation';
import { handleValidationMiddleware } from '../helpers/validation';
import { perUserRateLimiter } from '../helpers/rateLimiters';

const router = Router();

const friendRequestLimiter = perUserRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each user to 20 friend request actions per windowMs
  message: { message: 'Too many friend request actions, please try again later.' },
});

router.post('/add', authMiddleware, addContactValidation, handleValidationMiddleware, addContact);
router.post('/remove', authMiddleware, removeContactValidation, handleValidationMiddleware, removeContact);
router.post('/request', authMiddleware, friendRequestLimiter, sendFriendRequestValidation, handleValidationMiddleware, sendFriendRequest);
router.post('/accept', authMiddleware, friendRequestLimiter, acceptFriendRequestValidation, handleValidationMiddleware, acceptFriendRequest);
router.post('/reject', authMiddleware, friendRequestLimiter, rejectFriendRequestValidation, handleValidationMiddleware, rejectFriendRequest);
router.get('/requests', authMiddleware, handleValidationMiddleware, getFriendRequests);
router.get('/profile', authMiddleware, handleValidationMiddleware, getFullUserProfile);

export default router;
