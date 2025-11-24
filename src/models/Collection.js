import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Collection = sequelize.define('Collection', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'folder.fill'
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#007AFF'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'collections',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['userId', 'sortOrder']
    }
  ]
});

export default Collection;
