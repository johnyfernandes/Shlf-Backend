# Shlf Backend API

A comprehensive backend API for the Shlf book tracking application. Built with Node.js, Express, PostgreSQL, and integrates with the Open Library API.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Book Tracking**: Add books, track reading progress, and manage your library
- **Anonymous Usage**: Track up to 3 books without an account using device ID
- **Open Library Integration**: Search and fetch book details from Open Library API
- **Reading Sessions**: Track individual reading sessions with page progress
- **Statistics**: Get reading statistics and progress insights
- **Rate Limiting**: Protected endpoints with rate limiting
- **Security**: Helmet.js, CORS, and input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit
- **External API**: Open Library API

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd /path/to/Shlf-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Login to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE shlf_db;

   # Exit
   \q
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:
   - Database: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - Auth: set a strong `JWT_SECRET`; adjust `JWT_EXPIRES_IN` if needed
   - CORS (browser-only): native iOS/Android are not restricted by CORS. Leave `CORS_ORIGINS=*` for mobile-only, or set to web origins if you add a browser frontend (e.g., `https://shlf.app,https://app.shlf.app`).
   - Rate limit: `RATE_LIMIT_ENABLED`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
   - Open Library: `OPEN_LIBRARY_TIMEOUT_MS` and `OPEN_LIBRARY_API_BASE` (default is fine)

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "success": true,
  "message": "Shlf API is running",
  "timestamp": "2025-01-23T10:00:00.000Z"
}
```

---

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "bookworm",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "bookworm",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2025-01-23T10:00:00.000Z"
    }
  }
}
```

#### POST /api/auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

#### GET /api/auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

#### PUT /api/auth/profile
Update user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "bio": "Avid reader and book lover",
  "username": "newusername"
}
```

---

### Books

All book endpoints support both authenticated users and anonymous users (with device ID).

**Headers for authenticated users:**
```
Authorization: Bearer <token>
```

**Headers for anonymous users:**
```
X-Device-ID: <unique_device_identifier>
```

#### POST /api/books
Add a book to your library.

**Request Body:**
```json
{
  "openLibraryId": "/works/OL45883W",
  "isbn": "9780747532743",
  "title": "Harry Potter and the Philosopher's Stone",
  "subtitle": "",
  "authors": ["J.K. Rowling"],
  "coverImageUrl": "https://covers.openlibrary.org/b/id/12345-L.jpg",
  "description": "The first book in the Harry Potter series",
  "publishedDate": "1997",
  "pageCount": 223,
  "subjects": ["Fantasy", "Magic", "Adventure"],
  "readingStatus": "want_to_read"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "id": "uuid",
      "title": "Harry Potter and the Philosopher's Stone",
      "readingStatus": "want_to_read",
      "currentPage": 0,
      "progressPercentage": 0,
      ...
    }
  }
}
```

#### GET /api/books
Get all books in your library.

**Query Parameters:**
- `status`: Filter by reading status (want_to_read, reading, completed, did_not_finish)
- `sortBy`: Sort field (default: createdAt)
- `order`: Sort order (ASC, DESC)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [ ... ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    },
    "bookSlots": {
      "limit": 3,
      "used": 2,
      "remaining": 1,
      "requiresAccount": false
    }
  }
}
```

#### GET /api/books/:id
Get a single book by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "id": "uuid",
      "title": "Harry Potter and the Philosopher's Stone",
      "readingSessions": [ ... ],
      ...
    }
  }
}
```

#### PUT /api/books/:id
Update book details.

**Request Body:**
```json
{
  "readingStatus": "reading",
  "currentPage": 50,
  "rating": 5,
  "review": "Amazing book!",
  "notes": "Loved the character development",
  "isFavorite": true
}
```

#### DELETE /api/books/:id
Remove a book from your library.

**Response:**
```json
{
  "success": true,
  "message": "Book removed from library"
}
```

#### POST /api/books/:bookId/sessions
Add a reading session.

**Request Body:**
```json
{
  "startPage": 50,
  "endPage": 75,
  "duration": 30,
  "date": "2025-01-23",
  "notes": "Great reading session today"
}
```

#### GET /api/books/stats
Get reading statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBooks": 25,
    "wantToRead": 10,
    "currentlyReading": 5,
    "completed": 8,
    "didNotFinish": 2,
    "totalPagesRead": 5420,
    "averageRating": 4.2
  }
}
```

---

### Search (Open Library Integration)

#### GET /api/search
Search for books using Open Library.

**Query Parameters:**
- `q`: Search query (required)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Example:**
```
GET /api/search?q=harry potter&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "openLibraryId": "/works/OL45883W",
        "title": "Harry Potter and the Philosopher's Stone",
        "authors": ["J.K. Rowling"],
        "coverImageUrl": "...",
        "pageCount": 223,
        ...
      }
    ],
    "total": 1234,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

#### GET /api/search/book/:workId
Get detailed book information by Open Library Work ID.

**Example:**
```
GET /api/search/book/OL45883W
```

#### GET /api/search/isbn/:isbn
Get book information by ISBN.

**Example:**
```
GET /api/search/isbn/9780747532743
```

#### GET /api/search/author/:authorId
Get author details.

**Example:**
```
GET /api/search/author/OL23919A
```

---

## Database Schema

### Users Table
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `username`: String (Unique)
- `password`: String (Hashed)
- `firstName`: String
- `lastName`: String
- `bio`: Text
- `avatarUrl`: String
- `isEmailVerified`: Boolean
- `lastLoginAt`: Date
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Books Table
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key, nullable for anonymous)
- `deviceId`: String (For anonymous users)
- `openLibraryId`: String
- `isbn`: String
- `title`: String
- `subtitle`: String
- `authors`: JSONB Array
- `coverImageUrl`: String
- `description`: Text
- `publishedDate`: String
- `pageCount`: Integer
- `subjects`: JSONB Array
- `readingStatus`: Enum (want_to_read, reading, completed, did_not_finish)
- `currentPage`: Integer
- `startedAt`: Date
- `completedAt`: Date
- `rating`: Integer (1-5)
- `review`: Text
- `notes`: Text
- `isFavorite`: Boolean
- `openLibraryData`: JSONB
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### ReadingSessions Table
- `id`: UUID (Primary Key)
- `bookId`: UUID (Foreign Key)
- `startPage`: Integer
- `endPage`: Integer
- `duration`: Integer (minutes)
- `date`: Date
- `notes`: Text
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (e.g., book limit reached)
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

---

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Rate Limiting**: Prevents abuse
4. **Helmet.js**: Security headers
5. **CORS**: Configurable cross-origin requests
6. **Input Validation**: express-validator on all inputs
7. **SQL Injection Protection**: Sequelize ORM with parameterized queries

---

## Development

### Project Structure
```
Shlf-Backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   └── searchController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── bookLimit.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── ReadingSession.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   └── search.js
│   ├── services/
│   │   └── openLibraryService.js
│   ├── utils/
│   │   └── jwt.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Scripts
```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
```

---

## Integration with iOS App

### Device ID for Anonymous Users

For anonymous usage (up to 3 books), the iOS app should send a unique device identifier:

```swift
// Swift example
let deviceId = UIDevice.current.identifierForVendor?.uuidString

// In API requests
var request = URLRequest(url: url)
request.setValue(deviceId, forHTTPHeaderField: "X-Device-ID")
```

### Authentication

After login/register, store the JWT token securely:

```swift
// Store token
KeychainWrapper.standard.set(token, forKey: "authToken")

// Use in requests
request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
```

---

## Open Library API Integration

This backend provides a clean abstraction over the Open Library API with:
- Book search with pagination
- Detailed book information
- ISBN lookup
- Author information
- Cover image URLs

The Open Library data is cached in the database when books are added to reduce API calls.

---

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Social features (following users, sharing reviews)
- [ ] Reading goals and challenges
- [ ] Book recommendations
- [ ] Export reading data
- [ ] Multiple reading lists/shelves
- [ ] Book clubs/groups
- [ ] Integration with Goodreads
- [ ] Push notifications for reading reminders

---

## License

ISC

---

## Support

For issues or questions, please open an issue on the repository.
