import asyncHandler from '../utils/asyncHandler.js';
import Task from '../models/Task.js';
import Habit from '../models/Habit.js';
import PomodoroSession from '../models/PomodoroSession.js';

// @desc    Get dashboard statistics
// @route   GET /api/statistics
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
    // Basic implementation for stats
    const tasks = await Task.findByUser(req.user.id);
    const habits = await Habit.findByUser(req.user.id);
    const pomodoros = await PomodoroSession.findByUser(req.user.id);

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalFocusTime = pomodoros.reduce((acc, curr) => acc + curr.duration, 0);

    res.json({
        totalTasks: tasks.length,
        completedTasks,
        totalHabits: habits.length,
        totalFocusTime,
        productivityScore: Math.floor(Math.random() * 100) // Placeholder
    });
});
