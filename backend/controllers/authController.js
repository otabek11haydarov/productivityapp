import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import emailService from '../services/emailService.js';
import bcrypt from 'bcrypt';
import axios from 'axios';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findByEmail(email);

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userId = await User.create({
        name,
        email,
        password_hash,
        is_verified: true // Setting to true for simplicity now. Can implement email verification later.
    });

    if (userId) {
        generateToken(res, userId);
        res.status(201).json({
            id: userId,
            name,
            email,
            is_verified: true
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);

    if (user && !user.password_hash) {
        res.status(401);
        throw new Error('This account was created with Google. Please use Google to login.');
    }

    if (user && (await bcrypt.compare(password, user.password_hash))) {
        generateToken(res, user.id);
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            is_verified: user.is_verified
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar_url: req.user.avatar_url,
        is_verified: req.user.is_verified
    };
    res.status(200).json(user);
});

// @desc    Auth with Google
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = asyncHandler(async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        res.status(400);
        throw new Error('No Google token provided');
    }

    // Fetch user info using Google's access token
    let payload;
    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        payload = response.data;
    } catch (error) {
        res.status(401);
        throw new Error('Invalid Google access token');
    }

    if (!payload || !payload.email) {
        res.status(401);
        throw new Error('Invalid Google token data');
    }

    const { email, name, picture, sub: google_id } = payload;

    // Check if user exists by google_id or email
    let user = await User.findByGoogleId(google_id);
    
    if (!user) {
        user = await User.findByEmail(email);
        
        if (user) {
            // User exists with this email, link google account
            await User.update(user.id, { google_id, avatar_url: user.avatar_url || picture });
        } else {
            // Create new user
            const userId = await User.create({
                name,
                email,
                avatar_url: picture,
                is_verified: true,
                google_id
            });
            user = await User.findById(userId);
        }
    }

    generateToken(res, user.id);
    
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified
    });
});

// @desc    Check Google OAuth Configuration Status
// @route   GET /api/auth/google/status
// @access  Public
export const googleAuthStatus = asyncHandler(async (req, res) => {
    const isConfigured = !!process.env.GOOGLE_CLIENT_ID;
    
    if (!isConfigured) {
        res.status(503).json({
            googleOAuthConfigured: false,
            message: "Google OAuth is not configured. Missing GOOGLE_CLIENT_ID environment variable."
        });
        return;
    }
    
    res.status(200).json({
        googleOAuthConfigured: true,
        message: "Google OAuth is correctly configured on the backend."
    });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
        // Return 200 to prevent email enumeration attacks
        return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expiration to 1 hour using a native Date object so pg driver handles timezone conversion
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    console.log(`[Diagnostic] Generated raw token: ${resetToken}`);
    console.log(`[Diagnostic] Generated hashed token: ${resetTokenHash}`);
    console.log(`[Diagnostic] Expiry set to (UTC): ${expires.toISOString()}`);

    await User.update(user.id, {
        reset_password_token: resetTokenHash,
        reset_password_expires: expires
    });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // For local development: Always print the link so you aren't blocked by SMTP issues
    console.log(`\n========================================`);
    console.log(`[LOCAL DEV] PASSWORD RESET LINK:`);
    console.log(`${resetUrl}`);
    console.log(`========================================\n`);

    try {
        await emailService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
        // We log the error in the service, but we don't throw it here to prevent email enumeration
        console.error('Email delivery failed for user:', user.email);
    }

    res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        res.status(400);
        throw new Error('Please provide both token and new password');
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findByResetToken(resetTokenHash);

    if (!user) {
        res.status(400);
        throw new Error('Your reset link has expired or is invalid. Please request a new password reset link.');
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS) || 10);
    const newPasswordHash = await bcrypt.hash(password, salt);

    await User.update(user.id, {
        password_hash: newPasswordHash,
        reset_password_token: null,
        reset_password_expires: null
    });

    res.status(200).json({ message: 'Password has been successfully reset. You may now log in.' });
});

// @desc    Validate Reset Token
// @route   GET /api/auth/validate-reset-token/:token
// @access  Public
export const validateResetToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    console.log(`\n[Diagnostic] --- validateResetToken called ---`);
    console.log(`[Diagnostic] Incoming raw token: ${token}`);

    if (!token) {
        res.status(400);
        throw new Error('No token provided');
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log(`[Diagnostic] Hashed incoming token: ${resetTokenHash}`);
    
    const user = await User.findByResetToken(resetTokenHash);
    
    if (!user) {
        console.log(`[Diagnostic] Database lookup result: NO USER FOUND (or token expired)`);
        res.status(400);
        throw new Error('Reset link has expired or is invalid.');
    }

    console.log(`[Diagnostic] Database lookup result: SUCCESS for user ID ${user.id}`);
    res.status(200).json({ valid: true, message: 'Token is valid' });
});

// @desc    Debug Reset Token Details
// @route   GET /api/auth/debug-reset-token/:token
// @access  Public
export const debugResetToken = asyncHandler(async (req, res) => {
    const { token } = req.params;
    
    if (!token) return res.status(400).json({ error: 'No token provided' });

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // We will use the raw query directly here so we can bypass the > NOW() filter
    const pool = (await import('../config/db.js')).default;
    
    const { rows } = await pool.query('SELECT id, email, reset_password_token, reset_password_expires, NOW() as current_db_time FROM users WHERE reset_password_token = $1', [resetTokenHash]);
    
    if (rows.length === 0) {
        return res.status(404).json({
            found: false,
            message: "Token hash completely missing from database."
        });
    }

    const userRecord = rows[0];
    const isExpired = new Date(userRecord.reset_password_expires) <= new Date(userRecord.current_db_time);

    res.status(200).json({
        found: true,
        token_hash: resetTokenHash,
        user_email: userRecord.email,
        expiry: userRecord.reset_password_expires,
        current_db_time: userRecord.current_db_time,
        validation_result: isExpired ? 'EXPIRED' : 'VALID'
    });
});
