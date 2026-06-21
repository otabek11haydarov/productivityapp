import express from 'express';
import { sendTestEmail } from '../services/emailService.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// @desc    Test SMTP Email Delivery
// @route   GET /api/email/test
// @access  Public
router.get('/test', asyncHandler(async (req, res) => {
    const result = await sendTestEmail();
    
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
}));

export default router;
