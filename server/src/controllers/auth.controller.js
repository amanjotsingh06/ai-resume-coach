const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models/User.model');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SALT_ROUNDS = 12;
const JWT_EXPIRY = '7d';

/**
 * POST /api/auth/register
 * Body: { email, password, name }
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // ── Validation ──────────────────────────────────────────────
    const missing = [];
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (!name) missing.push('name');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Missing required fields: ${missing.join(', ')}`,
          hint: 'All fields (email, password, name) are required',
        },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters',
          hint: 'Choose a stronger password with at least 8 characters',
        },
      });
    }

    // ── Check duplicate email ───────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'AUTH_DUPLICATE',
          message: 'An account with this email already exists',
          hint: 'Try logging in or use a different email address',
        },
      });
    }

    // ── Hash password & save ────────────────────────────────────
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, password_hash, name });

    return res.status(201).json({
      success: true,
      data: { user: user.toSafeObject() },
    });
  } catch (err) {
    // Handle Mongoose duplicate key error (race condition)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'AUTH_DUPLICATE',
          message: 'An account with this email already exists',
          hint: 'Try logging in or use a different email address',
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        hint: 'Please try again later',
      },
    });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ──────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          hint: 'Provide both email and password to log in',
        },
      });
    }

    // ── Find user ───────────────────────────────────────────────
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Invalid email or password',
          hint: 'Check your credentials and try again',
        },
      });
    }

    // ── Verify password ─────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Invalid email or password',
          hint: 'Check your credentials and try again',
        },
      });
    }

    // ── Update last_login ───────────────────────────────────────
    user.last_login = new Date();
    await user.save();

    // ── Sign JWT ────────────────────────────────────────────────
    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        hint: 'Please try again later',
      },
    });
  }
};

/**
 * POST /api/auth/google
 * Body: { idToken }
 */
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'idToken is required' }
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || payload.email_verified === false) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID', message: 'Google email is not verified' }
      });
    }
    const { email, sub: google_id, name } = payload;

    // 1. Find user by google_id
    let user = await User.findOne({ google_id });

    if (!user) {
      // 2. If not found by google_id, check by email
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        // Link Google account
        user.google_id = google_id;
        if (!user.auth_provider) user.auth_provider = 'email'; // backwards compatibility
        await user.save();
      } else {
        // 3. Create new user
        user = await User.create({
          email: email.toLowerCase(),
          name,
          google_id,
          auth_provider: 'google',
        });
      }
    }

    // Update last_login
    user.last_login = new Date();
    await user.save();

    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRY
    });

    return res.status(200).json({
      success: true,
      data: { token, user: user.toSafeObject() }
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_INVALID', message: 'Invalid Google token' }
    });
  }
};

/**
 * PUT /api/auth/profile
 * Body: { name }
 * Requires: Bearer token
 */
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name must be at least 2 characters',
        },
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    return res.status(200).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' },
    });
  }
};

/**
 * PUT /api/auth/password
 * Body: { currentPassword, newPassword }
 * Requires: Bearer token
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Both passwords are required' },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' },
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID', message: 'Current password is incorrect' },
      });
    }

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return res.status(200).json({ success: true, data: { message: 'Password updated' } });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update password' },
    });
  }
};

module.exports = { register, login, googleLogin, updateProfile, updatePassword };
