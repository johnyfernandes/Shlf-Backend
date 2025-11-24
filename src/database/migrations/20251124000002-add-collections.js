import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  // Create collections table
  await queryInterface.createTable('collections', {
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
      allowNull: false
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
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  // Create indexes for collections
  await queryInterface.addIndex('collections', ['userId']);
  await queryInterface.addIndex('collections', ['userId', 'sortOrder']);

  // Create book_collections junction table
  await queryInterface.createTable('book_collections', {
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
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  // Create indexes for book_collections
  await queryInterface.addIndex('book_collections', ['bookId', 'collectionId'], { unique: true });
  await queryInterface.addIndex('book_collections', ['bookId']);
  await queryInterface.addIndex('book_collections', ['collectionId']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('book_collections');
  await queryInterface.dropTable('collections');
}
