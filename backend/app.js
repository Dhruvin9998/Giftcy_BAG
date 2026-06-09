import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import Route Handlers
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import bulkInquiryRoutes from './routes/bulkInquiryRoutes.js';

// Import Middleware & Utilities
import errorHandler from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/securityMiddleware.js';
import ApiError from './utils/apiError.js';

// Load Env variables
dotenv.config();

const app = express();

// 1. Logger Middleware (morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. Body Parser (JSON payload parsing limit to prevent DOS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. Cookie Parser
app.use(cookieParser());

// 4. Set Security HTTP Headers (helmet)
app.use(helmet());

// 5. CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://localhost:8081',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      const isLocal = origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1;
      if (isLocal || allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);

// 6. Prevent NoSQL Query Injection (mongo-sanitize)
app.use(mongoSanitize());

// 7. Prevent Cross Site Scripting attacks (xss-clean)
app.use(xss());

// 8. Rate Limiting (Throttle API requests)
app.use('/api', apiLimiter);

// 9. API Route Definitions
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/bulk-inquiries', bulkInquiryRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Giftcy REST API. Backend is healthy and operational.',
  });
});

// 10. Fallback Catch for undefined routes
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Cannot find ${req.originalUrl} on this server`));
});

// 11. Centralized Error Handling Interceptor
app.use(errorHandler);

export default app;
