const express = require('express');
const { register, login, googleLogin, updateProfile, updatePassword } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimit.middleware');

const authRouter = express.Router();

// POST /api/auth/register
authRouter.post('/register', authRateLimiter, register);

// POST /api/auth/login
authRouter.post('/login', authRateLimiter, login);

// POST /api/auth/google
authRouter.post('/google', authRateLimiter, googleLogin);

// PUT /api/auth/profile  — update display name (protected)
authRouter.put('/profile', requireAuth, updateProfile);

// PUT /api/auth/password — change password (protected)
authRouter.put('/password', requireAuth, updatePassword);

module.exports = { authRouter };
