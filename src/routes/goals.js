import express from 'express';
import { body } from 'express-validator';
import {
  setGoal,
  getGoals,
  getGoalByYear,
  deleteGoal
} from '../controllers/goalController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All goal routes require authentication
router.use(authMiddleware);

// Get all goals for user
router.get('/', getGoals);

// Get goal for specific year
router.get('/:year', getGoalByYear);

// Create or update goal
router.post(
  '/',
  [
    body('year').isInt({ min: 2000, max: 2100 }),
    body('targetBooks').isInt({ min: 1, max: 1000 }),
    body('targetPages').optional().isInt({ min: 0 })
  ],
  setGoal
);

// Delete goal
router.delete('/:id', deleteGoal);

export default router;
