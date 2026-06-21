import express from 'express';
import {
    getHabits,
    createHabit,
    updateHabit,
    deleteHabit
} from '../controllers/habitController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getHabits)
    .post(protect, createHabit);

router.route('/:id')
    .put(protect, updateHabit)
    .delete(protect, deleteHabit);

export default router;
