import asyncHandler from '../utils/asyncHandler.js';
import StopwatchSession from '../models/StopwatchSession.js';

// @desc    Get all stopwatch sessions
// @route   GET /api/stopwatch
// @access  Private
export const getSessions = asyncHandler(async (req, res) => {
    const sessions = await StopwatchSession.findByUser(req.user.id);
    res.json(sessions);
});

// @desc    Log a new stopwatch session
// @route   POST /api/stopwatch
// @access  Private
export const logSession = asyncHandler(async (req, res) => {
    const { duration } = req.body;

    if (!duration) {
        res.status(400);
        throw new Error('Please add a duration');
    }

    const sessionId = await StopwatchSession.create(req.user.id, req.body);
    
    res.status(201).json({
        id: sessionId,
        user_id: req.user.id,
        ...req.body
    });
});
