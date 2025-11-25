import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  // Create users table
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
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

  // Create books table
  await queryInterface.createTable('books', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    openLibraryId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: true
    },
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
      defaultValue: []
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
      defaultValue: []
    },
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    openLibraryData: {
      type: DataTypes.JSONB,
      allowNull: true
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

  // Create books indexes
  await queryInterface.addIndex('books', ['userId']);
  await queryInterface.addIndex('books', ['deviceId']);
  await queryInterface.addIndex('books', ['openLibraryId']);
  await queryInterface.addIndex('books', ['readingStatus']);

  // Create reading_sessions table
  await queryInterface.createTable('reading_sessions', {
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
      allowNull: true
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
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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

  // Create reading_sessions indexes
  await queryInterface.addIndex('reading_sessions', ['bookId']);
  await queryInterface.addIndex('reading_sessions', ['date']);

}

export async function down(queryInterface) {
  await queryInterface.dropTable('reading_sessions');
  await queryInterface.dropTable('books');
  await queryInterface.dropTable('users');
}
