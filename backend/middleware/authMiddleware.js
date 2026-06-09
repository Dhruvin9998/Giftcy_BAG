import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';

// Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Read token from Authorization Header or Cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ApiError(401, 'Not authorized to access this resource. Token missing.'));
    }

    // 2. Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user associated with this token (excluding password)
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError(401, 'User associated with this token no longer exists.'));
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Not authorized to access this resource. Token is invalid.'));
  }
};

// Restrict routes to specific user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`
        )
      );
    }
    next();
  };
};
