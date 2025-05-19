import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../validation/authValidation';
import { handleValidationMiddleware } from '../helpers/validation';
import { perUserRateLimiter } from '../helpers/rateLimiters';

const router = Router();

const authLimiter = perUserRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each user to 10 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
});

router.post(
  '/register',
  authLimiter,
  registerValidation,
  handleValidationMiddleware,
  register
);

router.post(
  '/login',
  authLimiter,
  loginValidation,
  handleValidationMiddleware,
  login
);

export default router;
