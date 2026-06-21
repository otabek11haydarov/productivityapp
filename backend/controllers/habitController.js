import asyncHandler from '../utils/asyncHandler.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';

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

// @desc    Toggle habit completion for today
// @route   POST /api/habits/:id/toggle
// @access  Private
export const toggleHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.user_id !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const result = await HabitLog.toggleToday(req.params.id);
    await Habit.recalculateStreaks(req.params.id);
    
    // Fetch updated habit
    const updatedHabit = await Habit.findById(req.params.id);
    
    res.json({ 
        action: result.action,
        date: result.date,
        habit: updatedHabit 
    });
});

// @desc    Get detailed habit statistics and logs
// @route   GET /api/habits/:id/details
// @access  Private
export const getHabitDetails = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.user_id !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const logs = await HabitLog.getLogsByHabit(req.params.id);
    const completedDates = await HabitLog.getCompletedDatesByHabit(req.params.id);
    
    // Calculate total checkins
    const totalCheckins = completedDates.length;
    
    // Calculate completion rate (assuming habit started on its created_at date)
    const startDate = new Date(habit.created_at);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let completionRate = 0;
    if (diffDays > 0) {
        completionRate = Math.round((totalCheckins / diffDays) * 100);
        if (completionRate > 100) completionRate = 100;
    } else if (totalCheckins > 0) {
        completionRate = 100;
    }

    res.json({
        ...habit,
        totalCheckins,
        completionRate,
        completedDates,
        logs
    });
});
