import express from 'express';
import {
  search,
  getDetails,
  getByISBN,
  getAuthor
} from '../controllers/searchController.js';

const router = express.Router();

// Search books
router.get('/', search);

// Get book details by Open Library Work ID
router.get('/book/:workId', getDetails);

// Get book by ISBN
router.get('/isbn/:isbn', getByISBN);

// Get author details
router.get('/author/:authorId', getAuthor);

export default router;
