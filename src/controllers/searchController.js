import { searchBooks, getBookDetails, getBookByISBN, getAuthorDetails } from '../services/openLibraryService.js';

/**
 * Search books using Open Library API
 */
export const search = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const result = await searchBooks(q, parseInt(page), parseInt(limit));

    res.json(result);
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search books'
    });
  }
};

/**
 * Get book details from Open Library
 */
export const getDetails = async (req, res) => {
  try {
    const { workId } = req.params;

    if (!workId) {
      return res.status(400).json({
        success: false,
        error: 'Work ID is required'
      });
    }

    const result = await getBookDetails(workId);

    res.json(result);
  } catch (error) {
    console.error('Get book details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get book details'
    });
  }
};

/**
 * Get book by ISBN
 */
export const getByISBN = async (req, res) => {
  try {
    const { isbn } = req.params;

    if (!isbn) {
      return res.status(400).json({
        success: false,
        error: 'ISBN is required'
      });
    }

    const result = await getBookByISBN(isbn);

    res.json(result);
  } catch (error) {
    console.error('Get book by ISBN error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get book by ISBN'
    });
  }
};

/**
 * Get author details
 */
export const getAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;

    if (!authorId) {
      return res.status(400).json({
        success: false,
        error: 'Author ID is required'
      });
    }

    const result = await getAuthorDetails(authorId);

    res.json(result);
  } catch (error) {
    console.error('Get author details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get author details'
    });
  }
};
