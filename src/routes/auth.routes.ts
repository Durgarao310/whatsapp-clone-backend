import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../validation/authValidation';
import { handleValidationMiddleware } from '../helpers/validation';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
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
