import sequelize from '../config/database.js';
import User from './User.js';
import Book from './Book.js';
import ReadingSession from './ReadingSession.js';
import ReadingGoal from './ReadingGoal.js';

// Define relationships
User.hasMany(Book, {
  foreignKey: 'userId',
  as: 'books',
  onDelete: 'CASCADE'
});

Book.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Book.hasMany(ReadingSession, {
  foreignKey: 'bookId',
  as: 'readingSessions',
  onDelete: 'CASCADE'
});

ReadingSession.belongsTo(Book, {
  foreignKey: 'bookId',
  as: 'book'
});

User.hasMany(ReadingGoal, {
  foreignKey: 'userId',
  as: 'readingGoals',
  onDelete: 'CASCADE'
});

ReadingGoal.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Sync database
export const syncDatabase = async (options = {}) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync(options);
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export {
  sequelize,
  User,
  Book,
  ReadingSession,
  ReadingGoal
};
