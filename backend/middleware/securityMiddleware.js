import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Ensure env variables are loaded before checking NODE_ENV due to ESM hoisting
dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

// General rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 500, // Limit each IP to 500 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Authentication rate limiter (more strict)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 1000 : 50, // Limit each IP to 50 authentication requests per hour
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

