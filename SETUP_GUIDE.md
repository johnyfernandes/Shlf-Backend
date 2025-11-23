# Shlf Backend - Quick Setup Guide

This guide will help you get the Shlf backend up and running in minutes.

## 1. Install PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# In PostgreSQL shell:
CREATE DATABASE shlf_db;
CREATE USER shlf_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE shlf_db TO shlf_user;

# Exit
\q
```

## 3. Install Dependencies

```bash
cd /Users/john/Developer/XCode/Shlf-Backend
npm install
```

## 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor
```

**Important settings to update in `.env`:**
```env
DB_PASSWORD=your_secure_password  # Change this!
JWT_SECRET=your_super_secret_jwt_key_change_this  # Change this!
```

## 5. Initialize Database

```bash
# Run migration to create tables
npm run db:migrate

# Or if you need to reset database (WARNING: Deletes all data)
npm run db:migrate -- --force
```

## 6. Start the Server

```bash
# Development mode (auto-reloads on changes)
npm run dev

# Production mode
npm start
```

## 7. Test the API

Open your browser or use curl:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Search for a book
curl "http://localhost:3000/api/search?q=harry+potter"

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## 8. Common Issues

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Make sure PostgreSQL is running:
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**Solution:** Update DB_PASSWORD in .env with correct PostgreSQL password

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change PORT in .env or stop the process using port 3000

## 9. iOS App Integration

In your iOS app, use these base URLs:

**Development (local):**
```swift
let baseURL = "http://localhost:3000/api"
```

**iOS Simulator:**
```swift
let baseURL = "http://localhost:3000/api"
```

**Physical Device (same network):**
```swift
// Replace with your computer's local IP
let baseURL = "http://192.168.1.xxx:3000/api"
```

**Production:**
Deploy to a cloud service and update the URL accordingly.

## 10. Next Steps

1. **Update iOS app** to use the API endpoints
2. **Implement device ID** for anonymous users in iOS app
3. **Add authentication** storage (Keychain) in iOS app
4. **Test all features** with the iOS app
5. **Deploy backend** to production (Heroku, AWS, Railway, etc.)

## API Base URL

All endpoints are prefixed with `/api`:
- Authentication: `/api/auth/*`
- Books: `/api/books/*`
- Search: `/api/search/*`

## Example API Calls

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "reader123",
  "password": "securepass"
}
```

### Add Book (Anonymous with Device ID)
```http
POST /api/books
X-Device-ID: YOUR-DEVICE-UUID
Content-Type: application/json

{
  "openLibraryId": "/works/OL45883W",
  "title": "Harry Potter and the Philosopher's Stone",
  "authors": ["J.K. Rowling"],
  "pageCount": 223
}
```

### Search Books
```http
GET /api/search?q=harry+potter&limit=10
```

---

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_NAME=shlf_production
DB_USER=production_user
DB_PASSWORD=strong_production_password
JWT_SECRET=very_long_random_string_for_production
CORS_ORIGIN=https://your-ios-app-domain.com
```

### Deployment Platforms

**Railway.app (Recommended for beginners)**
1. Create account at railway.app
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Add environment variables
6. Done!

**Heroku**
```bash
heroku create shlf-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku config:set JWT_SECRET=your_secret
```

**AWS/DigitalOcean**
- Requires more setup but gives more control
- Recommended for production at scale

---

Need help? Check the main README.md for full documentation!
