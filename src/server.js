import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Umzug, SequelizeStorage } from 'umzug';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sequelize from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import searchRoutes from './routes/search.js';
import sessionRoutes from './routes/sessions.js';
import collectionRoutes from './routes/collections.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (needed for correct client IPs behind load balancers)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const allowAllOrigins = configuredOrigins.length === 0 || configuredOrigins.includes('*');
const allowCredentials = (process.env.CORS_ALLOW_CREDENTIALS ?? 'true').toLowerCase() === 'true';

app.use(cors({
  origin: allowAllOrigins ? true : configuredOrigins,
  credentials: !allowAllOrigins && allowCredentials
}));

if (allowAllOrigins) {
  console.warn('⚠️  CORS is allowing all origins. This is fine for native/mobile clients; set CORS_ORIGINS to web origins if you add a browser frontend.');
}

// Rate limiting
const RATE_LIMIT_ENABLED = (process.env.RATE_LIMIT_ENABLED ?? 'true').toLowerCase() !== 'false';
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

if (RATE_LIMIT_ENABLED) {
  app.use('/api/', limiter);
} else {
  console.warn('⚠️  Rate limiting is disabled (RATE_LIMIT_ENABLED=false)');
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable response caching to avoid stale authenticated data
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Shlf API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/collections', collectionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database migrations
const runMigrations = async () => {
  const umzug = new Umzug({
    migrations: {
      glob: join(__dirname, 'database/migrations/*.js'),
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

  const pending = await umzug.pending();
  if (pending.length > 0) {
    console.log(`📦 Running ${pending.length} pending migration(s)...`);
    await umzug.up();
    console.log('✅ Migrations completed');
  } else {
    console.log('✅ Database schema is up to date');
  }
};

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run migrations (production-safe)
    await runMigrations();

    // Start server
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Shlf Backend API Server`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
