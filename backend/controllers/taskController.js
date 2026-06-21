import asyncHandler from '../utils/asyncHandler.js';
import Task from '../models/Task.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.findByUser(req.user.id);
    res.json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Please add a text field');
    }

    const taskId = await Task.create(req.user.id, req.body);
    const newTask = await Task.findById(taskId);

    res.status(201).json(newTask);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (task.user_id !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await Task.update(req.params.id, req.body);
    const updatedTask = await Task.findById(req.params.id);

    res.json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (task.user_id !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await Task.delete(req.params.id);

    res.json({ id: req.params.id, message: 'Task removed' });
});
