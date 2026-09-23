import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { config } from '../config/config.js';

const router = express.Router();

/**
 * Generate JWT token
 * @param {string} email - User email
 * @returns {string} JWT token
 */
const generateToken = (email) => {
  return jwt.sign(
    { sub: email },
    config.jwtSecret,
    { expiresIn: `${config.jwtExpire}m` }
  );
};

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Please provide name, email, and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user.email);

    console.log(`[AUTH] New user registered: ${user.email}`);

    res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      name: user.name,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body; // OAuth2PasswordRequestForm uses 'username' field

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user.email);

    console.log(`[AUTH] User logged in: ${user.email}`);

    res.json({
      access_token: token,
      token_type: 'bearer',
      name: user.name,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authenticate, async (req, res, next) => {
  try {
    const token = generateToken(req.user.email);
    
    res.json({
      access_token: token,
      token_type: 'bearer'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Please provide current and new password' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Find user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log(`[AUTH] Password changed for user: ${user.email}`);

    res.json({ 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
