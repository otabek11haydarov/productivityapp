import asyncHandler from '../utils/asyncHandler.js';
import PomodoroSession from '../models/PomodoroSession.js';

// @desc    Get all pomodoro sessions
// @route   GET /api/pomodoro
// @access  Private
export const getSessions = asyncHandler(async (req, res) => {
    const sessions = await PomodoroSession.findByUser(req.user.id);
    res.json(sessions);
});

// @desc    Log a new pomodoro session
// @route   POST /api/pomodoro
// @access  Private
export const logSession = asyncHandler(async (req, res) => {
    const { duration } = req.body;

    if (!duration) {
        res.status(400);
        throw new Error('Please add a duration');
    }

    const sessionId = await PomodoroSession.create(req.user.id, req.body);
    
    res.status(201).json({
        id: sessionId,
        user_id: req.user.id,
        ...req.body
    });
});
