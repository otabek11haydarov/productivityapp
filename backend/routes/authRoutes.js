import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    googleAuth,
    googleAuthStatus,
    forgotPassword,
    resetPassword,
    validateResetToken,
    debugResetToken
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/google/status', googleAuthStatus);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/validate-reset-token/:token', validateResetToken);
router.get('/debug-reset-token/:token', debugResetToken);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

export default router;
