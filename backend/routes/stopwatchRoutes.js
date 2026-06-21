import express from 'express';
import {
    getSessions,
    logSession
} from '../controllers/stopwatchController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getSessions)
    .post(protect, logSession);

export default router;
