import { ReadingSession, Book } from '../models/index.js';
import { validationResult } from 'express-validator';

const buildBookOwnershipWhere = (bookId, userId, deviceId) => {
  if (userId) {
    return { id: bookId, userId };
  }
  if (deviceId) {
    return { id: bookId, deviceId, userId: null };
  }
  return null;
};

const buildOwnedBookWhere = (userId, deviceId) => {
  if (userId) {
    return { userId };
  }
  if (deviceId) {
    return { deviceId, userId: null };
  }
  return null;
};

/**
 * Create a reading session
 */
export const createSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bookId, startPage, endPage, duration, startTime, endTime, date, notes } = req.body;
    const userId = req.userId;
    const deviceId = req.deviceId;

    const ownershipWhere = buildBookOwnershipWhere(bookId, userId, deviceId);

    if (!ownershipWhere) {
      return res.status(401).json({
        success: false,
        error: 'User or device must be provided'
      });
    }

    // Verify book belongs to user/device
    const book = await Book.findOne({ where: ownershipWhere });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const session = await ReadingSession.create({
      bookId,
      startPage,
      endPage,
      duration,
      startTime,
      endTime,
      date,
      notes
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create reading session'
    });
  }
};

/**
 * Get all sessions for a book
 */
export const getBookSessions = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.userId;
    const deviceId = req.deviceId;

    const ownershipWhere = buildBookOwnershipWhere(bookId, userId, deviceId);

    if (!ownershipWhere) {
      return res.status(401).json({
        success: false,
        error: 'User or device must be provided'
      });
    }

    // Verify book belongs to user/device
    const book = await Book.findOne({ where: ownershipWhere });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const sessions = await ReadingSession.findAll({
      where: { bookId },
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reading sessions'
    });
  }
};

/**
 * Get all sessions for the user
 */
export const getAllSessions = async (req, res) => {
  try {
    const userId = req.userId;
    const deviceId = req.deviceId;

    const ownedBookWhere = buildOwnedBookWhere(userId, deviceId);

    if (!ownedBookWhere) {
      return res.status(401).json({
        success: false,
        error: 'User or device must be provided'
      });
    }

    // Get all user's/device's books
    const books = await Book.findAll({
      where: ownedBookWhere,
      attributes: ['id']
    });

    const bookIds = books.map(book => book.id);

    const sessions = await ReadingSession.findAll({
      where: {
        bookId: {
          [Op.in]: bookIds
        }
      },
      include: [{
        model: Book,
        as: 'book',
        attributes: ['id', 'title', 'authors', 'coverImageUrl']
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reading sessions'
    });
  }
};

/**
 * Update a reading session
 */
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { startPage, endPage, duration, startTime, endTime, date, notes } = req.body;
    const userId = req.userId;
    const deviceId = req.deviceId;

    const ownershipWhere = buildOwnedBookWhere(userId, deviceId);

    if (!ownershipWhere) {
      return res.status(401).json({
        success: false,
        error: 'User or device must be provided'
      });
    }

    const session = await ReadingSession.findOne({
      where: { id },
      include: [{
        model: Book,
        as: 'book',
        where: ownershipWhere
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Update fields
    if (startPage !== undefined) session.startPage = startPage;
    if (endPage !== undefined) session.endPage = endPage;
    if (duration !== undefined) session.duration = duration;
    if (startTime !== undefined) session.startTime = startTime;
    if (endTime !== undefined) session.endTime = endTime;
    if (date !== undefined) session.date = date;
    if (notes !== undefined) session.notes = notes;

    await session.save();

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update reading session'
    });
  }
};

/**
 * Delete a reading session
 */
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const deviceId = req.deviceId;

    const ownershipWhere = buildOwnedBookWhere(userId, deviceId);

    if (!ownershipWhere) {
      return res.status(401).json({
        success: false,
        error: 'User or device must be provided'
      });
    }

    const session = await ReadingSession.findOne({
      where: { id },
      include: [{
        model: Book,
        as: 'book',
        where: ownershipWhere
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    await session.destroy();

    res.json({
      success: true,
      message: 'Reading session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete reading session'
    });
  }
};
