import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BookCollection = sequelize.define('BookCollection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  collectionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'collections',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  timestamps: true,
  tableName: 'book_collections',
  indexes: [
    {
      unique: true,
      fields: ['bookId', 'collectionId']
    },
    {
      fields: ['bookId']
    },
    {
      fields: ['collectionId']
    }
  ]
});

export default BookCollection;
