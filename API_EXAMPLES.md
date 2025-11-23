# Shlf API - Usage Examples

This document provides practical examples for integrating the Shlf backend API with your iOS app.

## Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Anonymous User Flow (3 Books)](#anonymous-user-flow)
3. [Book Management](#book-management)
4. [Search Integration](#search-integration)
5. [Progress Tracking](#progress-tracking)
6. [Swift Code Examples](#swift-code-examples)

---

## Authentication Flow

### 1. User Registration

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "reader@example.com",
  "username": "booklover",
  "password": "SecurePass123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "reader@example.com",
      "username": "booklover",
      "firstName": "Jane",
      "lastName": "Doe",
      "createdAt": "2025-01-23T10:00:00.000Z"
    }
  }
}
```

### 2. User Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "reader@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### 3. Get User Profile

**Request:**
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "reader@example.com",
      "username": "booklover",
      "firstName": "Jane",
      "lastName": "Doe",
      "bio": null,
      "createdAt": "2025-01-23T10:00:00.000Z"
    }
  }
}
```

---

## Anonymous User Flow

### 1. Add First Book (No Account)

**Request:**
```http
POST /api/books
X-Device-ID: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "openLibraryId": "/works/OL45883W",
  "title": "Harry Potter and the Philosopher's Stone",
  "authors": ["J.K. Rowling"],
  "coverImageUrl": "https://covers.openlibrary.org/b/id/10521270-L.jpg",
  "pageCount": 223,
  "isbn": "9780439708180",
  "readingStatus": "reading"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "id": "book-uuid-1",
      "title": "Harry Potter and the Philosopher's Stone",
      "readingStatus": "reading",
      "currentPage": 0,
      "pageCount": 223,
      "progressPercentage": 0
    }
  }
}
```

### 2. Get Books (Shows Remaining Slots)

**Request:**
```http
GET /api/books
X-Device-ID: 550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [ ... ],
    "pagination": { ... },
    "bookSlots": {
      "limit": 3,
      "used": 1,
      "remaining": 2,
      "requiresAccount": false
    }
  }
}
```

### 3. Attempting to Add 4th Book (Blocked)

**Request:**
```http
POST /api/books
X-Device-ID: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "openLibraryId": "/works/OL12345W",
  "title": "Fourth Book",
  ...
}
```

**Response:**
```json
{
  "success": false,
  "error": "Book limit reached. Create an account to add more books.",
  "code": "BOOK_LIMIT_REACHED",
  "limit": 3,
  "currentCount": 3,
  "requiresAccount": true
}
```

---

## Book Management

### 1. Search for Books

**Request:**
```http
GET /api/search?q=lord+of+the+rings&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "openLibraryId": "/works/OL27448W",
        "title": "The Lord of the Rings",
        "authors": ["J.R.R. Tolkien"],
        "publishedDate": "1954",
        "coverImageUrl": "https://covers.openlibrary.org/b/id/8455696-L.jpg",
        "pageCount": 1216,
        "subjects": ["Fantasy", "Fiction", "Adventure"],
        "isbn": "9780618640157"
      },
      ...
    ],
    "total": 847,
    "page": 1,
    "limit": 5,
    "hasMore": true
  }
}
```

### 2. Get Book Details from Open Library

**Request:**
```http
GET /api/search/book/OL27448W
```

**Response:**
```json
{
  "success": true,
  "data": {
    "openLibraryId": "/works/OL27448W",
    "title": "The Lord of the Rings",
    "subtitle": "The Fellowship of the Ring, The Two Towers, The Return of the King",
    "authors": ["J.R.R. Tolkien"],
    "description": "Epic fantasy adventure...",
    "publishedDate": "1954",
    "isbn": "9780618640157",
    "coverImageUrl": "https://covers.openlibrary.org/b/id/8455696-L.jpg",
    "pageCount": 1216,
    "subjects": ["Fantasy", "Fiction", "Adventure", "Middle-earth"]
  }
}
```

### 3. Add Book to Library (Authenticated)

**Request:**
```http
POST /api/books
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "openLibraryId": "/works/OL27448W",
  "title": "The Lord of the Rings",
  "authors": ["J.R.R. Tolkien"],
  "coverImageUrl": "https://covers.openlibrary.org/b/id/8455696-L.jpg",
  "pageCount": 1216,
  "isbn": "9780618640157",
  "subjects": ["Fantasy", "Fiction"],
  "readingStatus": "want_to_read"
}
```

### 4. Update Reading Progress

**Request:**
```http
PUT /api/books/book-uuid-1
Authorization: Bearer token...
Content-Type: application/json

{
  "readingStatus": "reading",
  "currentPage": 150
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "id": "book-uuid-1",
      "currentPage": 150,
      "pageCount": 223,
      "progressPercentage": 67,
      "readingStatus": "reading",
      "startedAt": "2025-01-23T10:00:00.000Z"
    }
  }
}
```

### 5. Mark Book as Completed

**Request:**
```http
PUT /api/books/book-uuid-1
Authorization: Bearer token...
Content-Type: application/json

{
  "readingStatus": "completed",
  "rating": 5,
  "review": "Absolutely loved this book! The characters were amazing."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "readingStatus": "completed",
      "completedAt": "2025-01-23T15:30:00.000Z",
      "currentPage": 223,
      "progressPercentage": 100,
      "rating": 5,
      "review": "Absolutely loved this book! The characters were amazing."
    }
  }
}
```

---

## Progress Tracking

### 1. Add Reading Session

**Request:**
```http
POST /api/books/book-uuid-1/sessions
Authorization: Bearer token...
Content-Type: application/json

{
  "startPage": 50,
  "endPage": 75,
  "duration": 35,
  "date": "2025-01-23",
  "notes": "Read during lunch break. Great chapter!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-uuid",
      "bookId": "book-uuid-1",
      "startPage": 50,
      "endPage": 75,
      "duration": 35,
      "date": "2025-01-23",
      "notes": "Read during lunch break. Great chapter!",
      "createdAt": "2025-01-23T12:30:00.000Z"
    }
  }
}
```

### 2. Get Reading Statistics

**Request:**
```http
GET /api/books/stats
Authorization: Bearer token...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBooks": 25,
    "wantToRead": 10,
    "currentlyReading": 3,
    "completed": 10,
    "didNotFinish": 2,
    "totalPagesRead": 5420,
    "averageRating": 4.3
  }
}
```

---

## Swift Code Examples

### 1. Network Manager

```swift
import Foundation

class ShlfAPIManager {
    static let shared = ShlfAPIManager()

    private let baseURL = "http://localhost:3000/api"
    private var authToken: String?
    private var deviceID: String

    init() {
        // Get or create device ID
        if let savedDeviceID = UserDefaults.standard.string(forKey: "deviceID") {
            self.deviceID = savedDeviceID
        } else {
            self.deviceID = UUID().uuidString
            UserDefaults.standard.set(self.deviceID, forKey: "deviceID")
        }
    }

    func setAuthToken(_ token: String) {
        self.authToken = token
        // Store in Keychain in production
        UserDefaults.standard.set(token, forKey: "authToken")
    }

    func clearAuthToken() {
        self.authToken = nil
        UserDefaults.standard.removeObject(forKey: "authToken")
    }

    private func createRequest(
        endpoint: String,
        method: String,
        body: [String: Any]? = nil
    ) -> URLRequest? {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else { return nil }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add auth token if available
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            // Add device ID for anonymous users
            request.setValue(deviceID, forHTTPHeaderField: "X-Device-ID")
        }

        // Add body if present
        if let body = body {
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        }

        return request
    }
}
```

### 2. Authentication

```swift
extension ShlfAPIManager {
    func register(
        email: String,
        username: String,
        password: String,
        firstName: String,
        lastName: String
    ) async throws -> (token: String, user: User) {
        guard let request = createRequest(
            endpoint: "/auth/register",
            method: "POST",
            body: [
                "email": email,
                "username": username,
                "password": password,
                "firstName": firstName,
                "lastName": lastName
            ]
        ) else {
            throw NetworkError.invalidURL
        }

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(AuthResponse.self, from: data)

        if response.success, let authData = response.data {
            setAuthToken(authData.token)
            return (authData.token, authData.user)
        } else {
            throw NetworkError.authenticationFailed
        }
    }

    func login(email: String, password: String) async throws -> (token: String, user: User) {
        guard let request = createRequest(
            endpoint: "/auth/login",
            method: "POST",
            body: ["email": email, "password": password]
        ) else {
            throw NetworkError.invalidURL
        }

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(AuthResponse.self, from: data)

        if response.success, let authData = response.data {
            setAuthToken(authData.token)
            return (authData.token, authData.user)
        } else {
            throw NetworkError.authenticationFailed
        }
    }
}
```

### 3. Book Management

```swift
extension ShlfAPIManager {
    func addBook(_ book: BookToAdd) async throws -> Book {
        guard let request = createRequest(
            endpoint: "/books",
            method: "POST",
            body: book.toDictionary()
        ) else {
            throw NetworkError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        // Check if limit reached
        if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 403 {
            let errorResponse = try JSONDecoder().decode(BookLimitError.self, from: data)
            throw NetworkError.bookLimitReached(errorResponse)
        }

        let bookResponse = try JSONDecoder().decode(BookResponse.self, from: data)

        if bookResponse.success, let bookData = bookResponse.data {
            return bookData.book
        } else {
            throw NetworkError.serverError
        }
    }

    func getBooks(status: BookStatus? = nil) async throws -> [Book] {
        var endpoint = "/books"
        if let status = status {
            endpoint += "?status=\(status.rawValue)"
        }

        guard let request = createRequest(endpoint: endpoint, method: "GET") else {
            throw NetworkError.invalidURL
        }

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(BooksListResponse.self, from: data)

        if response.success, let booksData = response.data {
            return booksData.books
        } else {
            throw NetworkError.serverError
        }
    }

    func updateBookProgress(bookID: String, currentPage: Int) async throws -> Book {
        guard let request = createRequest(
            endpoint: "/books/\(bookID)",
            method: "PUT",
            body: ["currentPage": currentPage]
        ) else {
            throw NetworkError.invalidURL
        }

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(BookResponse.self, from: data)

        if response.success, let bookData = response.data {
            return bookData.book
        } else {
            throw NetworkError.serverError
        }
    }
}
```

### 4. Search

```swift
extension ShlfAPIManager {
    func searchBooks(query: String, page: Int = 1) async throws -> SearchResults {
        let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let endpoint = "/search?q=\(encodedQuery)&page=\(page)&limit=20"

        guard let request = createRequest(endpoint: endpoint, method: "GET") else {
            throw NetworkError.invalidURL
        }

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(SearchResponse.self, from: data)

        if response.success, let searchData = response.data {
            return searchData
        } else {
            throw NetworkError.serverError
        }
    }
}
```

### 5. Data Models

```swift
struct User: Codable {
    let id: String
    let email: String
    let username: String
    let firstName: String?
    let lastName: String?
    let bio: String?
    let createdAt: String
}

struct Book: Codable, Identifiable {
    let id: String
    let title: String
    let subtitle: String?
    let authors: [String]
    let coverImageUrl: String?
    let pageCount: Int?
    let currentPage: Int
    let readingStatus: String
    let progressPercentage: Int
    let rating: Int?
    let review: String?
}

enum BookStatus: String, Codable {
    case wantToRead = "want_to_read"
    case reading = "reading"
    case completed = "completed"
    case didNotFinish = "did_not_finish"
}

enum NetworkError: Error {
    case invalidURL
    case authenticationFailed
    case bookLimitReached(BookLimitError)
    case serverError
}
```

---

## Complete User Flow Example

```swift
// 1. User opens app (anonymous)
let books = try await ShlfAPIManager.shared.getBooks()
// Shows 0 books, 3 slots available

// 2. User searches for a book
let results = try await ShlfAPIManager.shared.searchBooks(query: "Harry Potter")

// 3. User adds first book (no account needed)
let bookToAdd = BookToAdd(
    openLibraryId: results.first!.openLibraryId,
    title: results.first!.title,
    authors: results.first!.authors,
    pageCount: results.first!.pageCount
)
let addedBook = try await ShlfAPIManager.shared.addBook(bookToAdd)
// Success! 2 slots remaining

// 4. User tries to add 4th book
// Throws: NetworkError.bookLimitReached
// App shows: "Create an account to add more books"

// 5. User registers
let (token, user) = try await ShlfAPIManager.shared.register(
    email: "user@example.com",
    username: "reader",
    password: "secure123",
    firstName: "John",
    lastName: "Doe"
)
// Now has unlimited books!

// 6. User adds more books
// No more limits
```

---

For more details, see the main README.md file.
