import express from 'express';
import { getDashboardStats } from '../controllers/statisticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getDashboardStats);

export default router;
