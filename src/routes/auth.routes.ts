import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../validation/authValidation';
import { handleValidation } from '../helpers/validation';

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
  function(req: any, res: any, next: any) { handleValidation(req, res, next); },
  register
);

router.post(
  '/login',
  authLimiter,
  loginValidation,
  function(req: any, res: any, next: any) { handleValidation(req, res, next); },
  login
);

export default router;
