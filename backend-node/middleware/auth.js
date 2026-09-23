import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/User.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided',
        detail: 'Authorization header must be in format: Bearer <token>'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    if (!decoded.sub) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    
    // Find user
    const user = await User.findOne({ email: decoded.sub }).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        detail: 'The user associated with this token no longer exists'
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        detail: error.message
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        detail: 'Please login again to get a new token'
      });
    }
    console.error('[AUTH MIDDLEWARE] Error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if missing
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token provided, continue without user
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret);
    
    if (decoded.sub) {
      const user = await User.findOne({ email: decoded.sub }).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Token validation failed, continue without user
    next();
  }
};

export default authenticate;
