import asyncHandler from '../utils/asyncHandler.js';
import Habit from '../models/Habit.js';

// @desc    Get all habits
// @route   GET /api/habits
// @access  Private
export const getHabits = asyncHandler(async (req, res) => {
    const habits = await Habit.findByUser(req.user.id);
    res.json(habits);
});

// @desc    Create a habit
// @route   POST /api/habits
// @access  Private
export const createHabit = asyncHandler(async (req, res) => {
    const { title, frequency } = req.body;

    if (!title || !frequency) {
        res.status(400);
        throw new Error('Please add title and frequency fields');
    }

    const habitId = await Habit.create(req.user.id, req.body);
    const newHabit = await Habit.findById(habitId);

    res.status(201).json(newHabit);
});

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.user_id !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await Habit.update(req.params.id, req.body);
    const updatedHabit = await Habit.findById(req.params.id);

    res.json(updatedHabit);
});

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.user_id !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await Habit.delete(req.params.id);

    res.json({ id: req.params.id, message: 'Habit removed' });
});
