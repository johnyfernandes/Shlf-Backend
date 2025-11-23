import { Book } from '../models/index.js';

/**
 * Middleware to enforce 3-book limit for anonymous users
 * Users with accounts have unlimited books
 */
export const bookLimitMiddleware = async (req, res, next) => {
  try {
    // If user is authenticated, allow unlimited books
    if (req.userId) {
      return next();
    }

    // For anonymous users, check device ID
    if (!req.deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required for anonymous users',
        code: 'DEVICE_ID_REQUIRED'
      });
    }

    // Count books for this device
    const bookCount = await Book.count({
      where: {
        deviceId: req.deviceId,
        userId: null
      }
    });

    // Check if limit reached
    if (bookCount >= 3) {
      return res.status(403).json({
        success: false,
        error: 'Book limit reached. Create an account to add more books.',
        code: 'BOOK_LIMIT_REACHED',
        limit: 3,
        currentCount: bookCount,
        requiresAccount: true
      });
    }

    next();
  } catch (error) {
    console.error('Error in bookLimitMiddleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check book limit'
    });
  }
};

/**
 * Get remaining book slots for anonymous user
 */
export const getRemainingBookSlots = async (deviceId) => {
  const bookCount = await Book.count({
    where: {
      deviceId,
      userId: null
    }
  });

  return {
    limit: 3,
    used: bookCount,
    remaining: Math.max(0, 3 - bookCount),
    requiresAccount: bookCount >= 3
  };
};
