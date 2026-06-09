import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

// General rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 100, // Limit each IP to 100 requests per windowMs (10,000 in dev)
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
  max: isDev ? 1000 : 15, // Limit each IP to 15 authentication requests per hour (1,000 in dev)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

