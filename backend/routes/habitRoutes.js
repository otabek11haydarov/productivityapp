import express from 'express';
import {
    getHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    getHabitDetails
} from '../controllers/habitController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getHabits)
    .post(protect, createHabit);

router.route('/:id')
    .put(protect, updateHabit)
    .delete(protect, deleteHabit);

router.post('/:id/toggle', protect, toggleHabit);
router.get('/:id/details', protect, getHabitDetails);

export default router;
