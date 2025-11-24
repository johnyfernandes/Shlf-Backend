import { Collection, Book, BookCollection } from '../models/index.js';

// Get all collections for user
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Book,
        as: 'books',
        attributes: ['id', 'title', 'coverImageUrl']
      }],
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collections'
    });
  }
};

// Create a new collection
export const createCollection = async (req, res) => {
  try {
    const { name, icon, color, sortOrder } = req.body;

    const collection = await Collection.create({
      userId: req.user.id,
      name,
      icon: icon || 'folder.fill',
      color: color || '#007AFF',
      sortOrder: sortOrder || 0
    });

    res.status(201).json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create collection'
    });
  }
};

// Update a collection
export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, sortOrder } = req.body;

    const collection = await Collection.findOne({
      where: { id, userId: req.user.id }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    await collection.update({
      name: name !== undefined ? name : collection.name,
      icon: icon !== undefined ? icon : collection.icon,
      color: color !== undefined ? color : collection.color,
      sortOrder: sortOrder !== undefined ? sortOrder : collection.sortOrder
    });

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update collection'
    });
  }
};

// Delete a collection
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findOne({
      where: { id, userId: req.user.id }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    await collection.destroy();

    res.json({
      success: true,
      message: 'Collection deleted'
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete collection'
    });
  }
};

// Add a book to a collection
export const addBookToCollection = async (req, res) => {
  try {
    const { id } = req.params; // collection id
    const { bookId } = req.body;

    // Verify collection belongs to user
    const collection = await Collection.findOne({
      where: { id, userId: req.user.id }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Verify book belongs to user
    const book = await Book.findOne({
      where: { id: bookId, userId: req.user.id }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Add to collection (ignore if already exists)
    await BookCollection.findOrCreate({
      where: { bookId, collectionId: id }
    });

    res.json({
      success: true,
      message: 'Book added to collection'
    });
  } catch (error) {
    console.error('Error adding book to collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add book to collection'
    });
  }
};

// Remove a book from a collection
export const removeBookFromCollection = async (req, res) => {
  try {
    const { id, bookId } = req.params;

    // Verify collection belongs to user
    const collection = await Collection.findOne({
      where: { id, userId: req.user.id }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    await BookCollection.destroy({
      where: { bookId, collectionId: id }
    });

    res.json({
      success: true,
      message: 'Book removed from collection'
    });
  } catch (error) {
    console.error('Error removing book from collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove book from collection'
    });
  }
};
