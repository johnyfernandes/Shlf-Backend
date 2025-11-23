import { syncDatabase } from '../models/index.js';

const runMigration = async () => {
  try {
    console.log('Starting database migration...');

    // Sync database with force option (WARNING: This will drop existing tables)
    // For production, you should use proper migrations
    const forceSync = process.argv.includes('--force');

    await syncDatabase({
      force: forceSync,
      alter: !forceSync
    });

    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
};

runMigration();
