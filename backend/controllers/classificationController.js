import asyncHandler from '../utils/asyncHandler.js';
import Classification from '../models/Classification.js';

// @desc    Get all classifications for a user
// @route   GET /api/classifications
// @access  Private
export const getClassifications = asyncHandler(async (req, res) => {
    const classifications = await Classification.findByUser(req.user.id);
    res.json(classifications);
});

// @desc    Create a classification
// @route   POST /api/classifications
// @access  Private
export const createClassification = asyncHandler(async (req, res) => {
    const { name, color } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a name for the classification');
    }

    const classificationId = await Classification.create(req.user.id, name, color);
    const newClassification = await Classification.findById(classificationId);

    res.status(201).json(newClassification);
});

// @desc    Update classification
// @route   PUT /api/classifications/:id
// @access  Private
export const updateClassification = asyncHandler(async (req, res) => {
    const classification = await Classification.findById(req.params.id);

    if (!classification) {
        res.status(404);
        throw new Error('Classification not found');
    }

    // Make sure the logged in user matches the classification user
    if (classification.user_id !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await Classification.update(req.params.id, req.body.name, req.body.color);
    const updatedClassification = await Classification.findById(req.params.id);

    res.json(updatedClassification);
});

// @desc    Delete classification
// @route   DELETE /api/classifications/:id
// @access  Private
export const deleteClassification = asyncHandler(async (req, res) => {
    const classification = await Classification.findById(req.params.id);

    if (!classification) {
        res.status(404);
        throw new Error('Classification not found');
    }

    if (classification.user_id !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await Classification.delete(req.params.id);

    res.json({ id: req.params.id, message: 'Classification removed' });
});
