import express from 'express';
import { body } from 'express-validator';
import {
  createSession,
  getBookSessions,
  getAllSessions,
  updateSession,
  deleteSession
} from '../controllers/sessionController.js';
import { optionalAuthMiddleware, deviceIdMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware
router.use(deviceIdMiddleware);
router.use(optionalAuthMiddleware);

// Get all sessions for user/device
router.get('/', getAllSessions);

// Get sessions for a specific book
router.get('/book/:bookId', getBookSessions);

// Create session
router.post(
  '/',
  [
    body('bookId').notEmpty().isUUID(),
    body('startPage').isInt({ min: 0 }),
    body('endPage').isInt({ min: 0 }),
    body('duration').optional().isInt({ min: 0 }),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
    body('date').optional().isISO8601(),
    body('notes').optional().isString()
  ],
  createSession
);

// Update session
router.put(
  '/:id',
  [
    body('startPage').optional().isInt({ min: 0 }),
    body('endPage').optional().isInt({ min: 0 }),
    body('duration').optional().isInt({ min: 0 }),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
    body('date').optional().isISO8601(),
    body('notes').optional().isString()
  ],
  updateSession
);

// Delete session
router.delete('/:id', deleteSession);

export default router;
