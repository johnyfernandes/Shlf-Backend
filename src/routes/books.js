import express from 'express';
import { body } from 'express-validator';
import {
  addBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  addReadingSession,
  getReadingStats
} from '../controllers/bookController.js';
import { optionalAuthMiddleware, deviceIdMiddleware } from '../middleware/auth.js';
import { bookLimitMiddleware } from '../middleware/bookLimit.js';

const router = express.Router();

// Apply device ID middleware to all routes
router.use(deviceIdMiddleware);

// Apply optional auth middleware to all routes
router.use(optionalAuthMiddleware);

// Get all books
router.get('/', getBooks);

// Get reading statistics
router.get('/stats', getReadingStats);

// Get single book
router.get('/:id', getBook);

// Add book (with limit check for anonymous users)
router.post(
  '/',
  bookLimitMiddleware,
  [
    body('openLibraryId').notEmpty(),
    body('title').notEmpty(),
    body('readingStatus').optional().isIn(['want_to_read', 'reading', 'completed', 'did_not_finish'])
  ],
  addBook
);

// Update book
router.put(
  '/:id',
  [
    body('readingStatus').optional().isIn(['want_to_read', 'reading', 'completed', 'did_not_finish']),
    body('currentPage').optional().isInt({ min: 0 }),
    body('rating').optional().isInt({ min: 1, max: 5 })
  ],
  updateBook
);

// Delete book
router.delete('/:id', deleteBook);

// Add reading session
router.post(
  '/:bookId/sessions',
  [
    body('startPage').isInt({ min: 0 }),
    body('endPage').isInt({ min: 0 }),
    body('duration').optional().isInt({ min: 0 }),
    body('date').optional().isISO8601()
  ],
  addReadingSession
);

export default router;
