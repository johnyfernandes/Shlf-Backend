import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReadingSession = sequelize.define('ReadingSession', {
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
  startPage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  endPage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reading duration in minutes'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'reading_sessions',
  indexes: [
    {
      fields: ['bookId']
    },
    {
      fields: ['date']
    }
  ]
});

export default ReadingSession;
