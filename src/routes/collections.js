import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addBookToCollection,
  removeBookFromCollection
} from '../controllers/collectionController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Collection CRUD
router.get('/', getCollections);
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Book-Collection management
router.post('/:id/books', addBookToCollection);
router.delete('/:id/books/:bookId', removeBookFromCollection);

export default router;
