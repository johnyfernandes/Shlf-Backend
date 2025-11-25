import { Book, ReadingSession } from '../models/index.js';
import { validationResult } from 'express-validator';
import { getBookDetails, getBookByISBN } from '../services/openLibraryService.js';
import { Op } from 'sequelize';
import { getRemainingBookSlots } from '../middleware/bookLimit.js';

/**
 * Add a book to user's library
 */
export const addBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      openLibraryId,
      isbn,
      title,
      subtitle,
      authors,
      coverImageUrl,
      description,
      publishedDate,
      pageCount,
      subjects,
      readingStatus
    } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Check if book already exists for this user
    const existingBook = await Book.findOne({
      where: {
        openLibraryId,
        userId: req.userId
      }
    });

    if (existingBook) {
      return res.status(400).json({
        success: false,
        error: 'Book already in your library'
      });
    }

    // Fetch additional details from Open Library if needed
    let bookData = {
      title,
      subtitle,
      authors,
      coverImageUrl,
      description,
      publishedDate,
      pageCount,
      subjects
    };

    if (!title && openLibraryId) {
      const details = await getBookDetails(openLibraryId);
      bookData = { ...bookData, ...details.data };
    }

    // Create book
    const book = await Book.create({
      userId: req.userId,
      deviceId: null,
      openLibraryId,
      isbn,
      ...bookData,
      readingStatus: readingStatus || 'want_to_read',
      openLibraryData: bookData.rawWorkData
    });

    res.status(201).json({
      success: true,
      data: {
        book: formatBookResponse(book)
      }
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add book'
    });
  }
};

/**
 * Get all books for user/device
 */
export const getBooks = async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', order = 'DESC', page = 1, limit = 20 } = req.query;

    const where = {};

    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'rating', 'currentPage', 'readingStatus'];
    const allowedStatuses = ['want_to_read', 'reading', 'completed', 'did_not_finish'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = (order || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);

    // Require auth
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    where.userId = req.userId;

    // Filter by reading status
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid reading status filter'
        });
      }
      where.readingStatus = status;
    }

    const offset = (safePage - 1) * safeLimit;

    const { count, rows: books } = await Book.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit: safeLimit,
      offset,
      include: [
        {
          association: 'readingSessions',
          attributes: ['id', 'date', 'startPage', 'endPage', 'duration']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        books: books.map(formatBookResponse),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get books'
    });
  }
};

/**
 * Get single book by ID
 */
export const getBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const where = { id, userId: req.userId };

    const book = await Book.findOne({
      where,
      include: [
        {
          association: 'readingSessions',
          order: [['date', 'DESC']]
        }
      ]
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: {
        book: formatBookResponse(book)
      }
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get book'
    });
  }
};

/**
 * Update book (status, progress, rating, notes)
 */
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      readingStatus,
      currentPage,
      rating,
      review,
      notes,
      isFavorite
    } = req.body;

    const where = { id };

    if (req.userId) {
      where.userId = req.userId;
    }

    const book = await Book.findOne({ where });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const updates = {};

    if (readingStatus !== undefined) {
      updates.readingStatus = readingStatus;

      // Auto-set dates based on status
      if (readingStatus === 'reading' && !book.startedAt) {
        updates.startedAt = new Date();
      }
      if (readingStatus === 'completed' && !book.completedAt) {
        updates.completedAt = new Date();
        updates.currentPage = book.pageCount || book.currentPage;
      }
    }

    if (currentPage !== undefined) {
      if (book.pageCount && currentPage > book.pageCount) {
        return res.status(400).json({
          success: false,
          error: 'Current page cannot exceed total page count'
        });
      }
      updates.currentPage = currentPage;
    }

    if (rating !== undefined) {
      updates.rating = rating;
    }

    if (review !== undefined) {
      updates.review = review;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    if (isFavorite !== undefined) {
      updates.isFavorite = isFavorite;
    }

    await book.update(updates);

    res.json({
      success: true,
      data: {
        book: formatBookResponse(book)
      }
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update book'
    });
  }
};

/**
 * Delete book from library
 */
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const where = { id };

    if (req.userId) {
      where.userId = req.userId;
    }

    const book = await Book.findOne({ where });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    await book.destroy();

    res.json({
      success: true,
      message: 'Book removed from library'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete book'
    });
  }
};

/**
 * Add reading session
 */
export const addReadingSession = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { startPage, endPage, duration, date, notes } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Verify book ownership
    const where = { id: bookId, userId: req.userId };

    const book = await Book.findOne({ where });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Create reading session
    const session = await ReadingSession.create({
      bookId,
      startPage,
      endPage,
      duration,
      date: date || new Date(),
      notes
    });

    // Update book's current page
    if (endPage > book.currentPage) {
      await book.update({ currentPage: endPage });
    }

    res.status(201).json({
      success: true,
      data: {
        session
      }
    });
  } catch (error) {
    console.error('Add reading session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add reading session'
    });
  }
};

/**
 * Get reading statistics
 */
export const getReadingStats = async (req, res) => {
  try {
    const where = {};

    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    where.userId = req.userId;

    const books = await Book.findAll({ where });

    const stats = {
      totalBooks: books.length,
      wantToRead: books.filter(b => b.readingStatus === 'want_to_read').length,
      currentlyReading: books.filter(b => b.readingStatus === 'reading').length,
      completed: books.filter(b => b.readingStatus === 'completed').length,
      didNotFinish: books.filter(b => b.readingStatus === 'did_not_finish').length,
      totalPagesRead: books.reduce((sum, b) => sum + (b.readingStatus === 'completed' ? (b.pageCount || 0) : b.currentPage), 0),
      averageRating: books.filter(b => b.rating).length > 0
        ? books.reduce((sum, b) => sum + (b.rating || 0), 0) / books.filter(b => b.rating).length
        : null
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get reading stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reading statistics'
    });
  }
};

/**
 * Format book response
 */
function formatBookResponse(book) {
  const bookData = book.toJSON ? book.toJSON() : book;

  return {
    ...bookData,
    progressPercentage: book.getProgressPercentage ? book.getProgressPercentage() : 0
  };
}
