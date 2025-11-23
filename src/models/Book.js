import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // null for anonymous users (up to 3 books)
    references: {
      model: 'users',
      key: 'id'
    }
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true, // For anonymous users, we track by device
    comment: 'Device identifier for anonymous users'
  },
  // Open Library book identifiers
  openLibraryId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Open Library Work ID (e.g., /works/OL45883W)'
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Book details from Open Library
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  authors: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of author names'
  },
  coverImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  publishedDate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pageCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  subjects: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of subject/genre tags'
  },
  // Reading status and progress
  readingStatus: {
    type: DataTypes.ENUM('want_to_read', 'reading', 'completed', 'did_not_finish'),
    allowNull: false,
    defaultValue: 'want_to_read'
  },
  currentPage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // User's personal data
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Metadata
  openLibraryData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Cached Open Library API response'
  }
}, {
  timestamps: true,
  tableName: 'books',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['deviceId']
    },
    {
      fields: ['openLibraryId']
    },
    {
      fields: ['readingStatus']
    }
  ]
});

// Calculate reading progress percentage
Book.prototype.getProgressPercentage = function() {
  if (!this.pageCount || this.pageCount === 0) return 0;
  return Math.min(Math.round((this.currentPage / this.pageCount) * 100), 100);
};

export default Book;
