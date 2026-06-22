import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    console.log('[Auth Middleware] Received cookies:', req.cookies);
    token = req.cookies.jwt;

    if (token) {
        try {
            console.log('[Auth Middleware] Token found. Verifying...');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('[Auth Middleware] Decoded payload:', decoded);
            
            req.user = await User.findById(decoded.userId);
            
            if (!req.user) {
                console.log('[Auth Middleware] Database lookup failed for userId:', decoded.userId);
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            
            console.log('[Auth Middleware] User successfully authenticated:', req.user.email);
            
            // Remove password_hash from req.user
            delete req.user.password_hash;
            
            next();
        } catch (error) {
            console.error('[Auth Middleware] Token verification failed:', error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        console.warn('[Auth Middleware] Request missing JWT cookie.');
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export { protect };
