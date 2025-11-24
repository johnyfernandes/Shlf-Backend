import { ReadingGoal } from '../models/index.js';
import { validationResult } from 'express-validator';

/**
 * Create or update a reading goal
 */
export const setGoal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { year, targetBooks, targetPages } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User must be authenticated to set goals'
      });
    }

    // Check if goal already exists for this year
    const existingGoal = await ReadingGoal.findOne({
      where: {
        userId,
        year
      }
    });

    if (existingGoal) {
      // Update existing goal
      existingGoal.targetBooks = targetBooks;
      existingGoal.targetPages = targetPages;
      await existingGoal.save();

      return res.json({
        success: true,
        data: existingGoal
      });
    }

    // Create new goal
    const goal = await ReadingGoal.create({
      userId,
      year,
      targetBooks,
      targetPages
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error setting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set reading goal'
    });
  }
};

/**
 * Get all reading goals for the user
 */
export const getGoals = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User must be authenticated'
      });
    }

    const goals = await ReadingGoal.findAll({
      where: { userId },
      order: [['year', 'DESC']]
    });

    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reading goals'
    });
  }
};

/**
 * Get goal for a specific year
 */
export const getGoalByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User must be authenticated'
      });
    }

    const goal = await ReadingGoal.findOne({
      where: {
        userId,
        year: parseInt(year)
      }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found for this year'
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reading goal'
    });
  }
};

/**
 * Delete a reading goal
 */
export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User must be authenticated'
      });
    }

    const goal = await ReadingGoal.findOne({
      where: {
        id,
        userId
      }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    await goal.destroy();

    res.json({
      success: true,
      message: 'Reading goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete reading goal'
    });
  }
};
