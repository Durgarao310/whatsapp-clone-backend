import rateLimit from 'express-rate-limit';
import { AuthedRequest } from '../types';

// Per-user rate limiter (uses req.user.id if available, else falls back to IP)
export const perUserRateLimiter = (options: any = {}) =>
  rateLimit({
    keyGenerator: (req: AuthedRequest) => {
      return req.user?.id || req.ip;
    },
    ...options,
  });

// Per-IP rate limiter (default keyGenerator)
export const perIpRateLimiter = (options: any = {}) =>
  rateLimit({
    ...options,
  });
