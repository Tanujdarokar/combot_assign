# FeaturePulse API Documentation

Base URL: `http://localhost:5000/api`

---

## Authentication Endpoints

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "64a...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "isEmailVerified": true
    }
  }
  ```

### 2. Login User
- **Endpoint:** `POST /api/auth/login`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:** `200 OK` (Sets httpOnly `refreshToken` cookie)

### 3. Logout User
- **Endpoint:** `POST /api/auth/logout`
- **Authentication:** None
- **Response:** `200 OK`

### 4. Refresh Access Token
- **Endpoint:** `POST /api/auth/refresh`
- **Authentication:** httpOnly Cookie (`refreshToken`)
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi...",
    "user": { ... }
  }
  ```

---

## Feature Request Endpoints

### 1. Get All Posts
- **Endpoint:** `GET /api/posts`
- **Query Parameters:** `category`, `status`, `search`, `sort` (votes, newest, comments), `page`, `limit`
- **Response:** `200 OK`

### 2. Create Feature Request
- **Endpoint:** `POST /api/posts`
- **Authentication:** Bearer Token (Private)
- **Request Body:**
  ```json
  {
    "title": "Dark Mode Support",
    "description": "Please add dark mode across the entire dashboard.",
    "category": "UI/UX"
  }
  ```
- **Response:** `201 Created`

### 3. Upvote Post (Atomic)
- **Endpoint:** `POST /api/posts/:id/vote`
- **Authentication:** Bearer Token (Private)
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "votes": 12,
    "hasVoted": true,
    "data": { ... }
  }
  ```

---

## Comments Endpoints

### 1. Get Comments for Post
- **Endpoint:** `GET /api/posts/:postId/comments`
- **Response:** `200 OK`

### 2. Create Comment or Reply
- **Endpoint:** `POST /api/posts/:postId/comments`
- **Authentication:** Bearer Token (Private)
- **Request Body:**
  ```json
  {
    "content": "This would be extremely helpful!",
    "parentComment": "optional_parent_id_for_threaded_replies"
  }
  ```
- **Response:** `201 Created`

---

## Admin Endpoints (RBAC)

### 1. Get Admin Stats
- **Endpoint:** `GET /api/admin/stats`
- **Authentication:** Bearer Token + Admin Role

### 2. Update Feature Status
- **Endpoint:** `PATCH /api/admin/posts/:id/status`
- **Authentication:** Bearer Token + Admin Role
- **Request Body:**
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Response:** `200 OK`
