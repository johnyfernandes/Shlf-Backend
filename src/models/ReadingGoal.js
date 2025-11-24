import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReadingGoal = sequelize.define('ReadingGoal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  targetBooks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 1000
    }
  },
  targetPages: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  }
}, {
  timestamps: true,
  tableName: 'reading_goals',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'year']
    },
    {
      fields: ['year']
    }
  ]
});

export default ReadingGoal;
