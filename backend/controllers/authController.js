import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcrypt';

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
