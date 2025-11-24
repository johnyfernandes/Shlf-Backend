import { Umzug, SequelizeStorage } from 'umzug';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const umzug = new Umzug({
  migrations: {
    glob: join(__dirname, 'migrations/*.js'),
    resolve: ({ name, path, context }) => {
      const migration = import(path);
      return {
        name,
        up: async () => (await migration).up(context),
        down: async () => (await migration).down(context),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const runMigrations = async () => {
  const args = process.argv.slice(2);

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    if (args.includes('--status')) {
      const pending = await umzug.pending();
      const executed = await umzug.executed();

      console.log('\n📋 Migration Status:');
      console.log('-------------------');
      console.log(`Executed: ${executed.length}`);
      executed.forEach(m => console.log(`  ✅ ${m.name}`));
      console.log(`Pending: ${pending.length}`);
      pending.forEach(m => console.log(`  ⏳ ${m.name}`));

    } else if (args.includes('--undo')) {
      console.log('\n⏪ Rolling back last migration...');
      await umzug.down();
      console.log('✅ Rollback completed');

    } else {
      console.log('\n🚀 Running pending migrations...');
      const migrations = await umzug.up();

      if (migrations.length === 0) {
        console.log('✅ No pending migrations');
      } else {
        console.log(`✅ Applied ${migrations.length} migration(s):`);
        migrations.forEach(m => console.log(`  - ${m.name}`));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Export for programmatic use
export { umzug };

// Run if called directly
runMigrations();
