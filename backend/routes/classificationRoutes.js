import express from 'express';
import {
    getClassifications,
    createClassification,
    updateClassification,
    deleteClassification
} from '../controllers/classificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getClassifications)
    .post(protect, createClassification);

router.route('/:id')
    .put(protect, updateClassification)
    .delete(protect, deleteClassification);

export default router;
