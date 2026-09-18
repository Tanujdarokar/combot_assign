# Feature Request & Public Roadmap Portal (FeaturePulse / Canny Clone)

A production-quality, full-stack customer feedback and product roadmap platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

---

## Features

### 1. Authentication & Security
- **Secure Dual-Token JWT Auth**: 15-minute access tokens + 7-day refresh tokens stored securely in `httpOnly` cookies.
- **RBAC**: Role-based access control (`user` and `admin`) with protected API routes and frontend guards.
- **Password Management**: Signup, login, logout, password reset simulation.

### 2. Feature Request Portal & Feed
- **Submission Modal**: Rich markdown descriptions, categories (`UI/UX`, `Integrations`, `Performance`, `General`).
- **Advanced Feed**: Sorting (Most Upvoted, Newest, Most Discussed), category filtering, status filtering, and pagination.
- **Debounced Search**: Full-text search across titles and descriptions with optimized API calls.

### 3. Atomic Upvoting System
- **Race-Condition Safe**: MongoDB atomic operators (`$addToSet`, `$pull`, `$inc`) prevent duplicate voting.
- **Optimistic UI**: Instant state update with automatic rollback on error.

### 4. Threaded Discussions
- **Comments & Replies**: Full support for nested threaded comments (`parentComment`).
- **Markdown Support**: Render rich text discussions.
- **Moderation**: Authors and admins can edit/delete comments.

### 5. Admin Dashboard
- **Overview Statistics**: Total users, requests, votes, and comments.
- **Status Workflow**: Manage feature statuses (`Under Review` → `Planned` → `In Progress` → `Completed`) which instantly synchronizes with the public roadmap.
- **Moderation Tools**: Delete inappropriate posts or comments.

### 6. Public Product Roadmap
- **3-Column Kanban Board**: Visualizes features by status (`Planned`, `In Progress`, `Completed`) with real-time backend synchronization.

---

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, React Router DOM, Axios.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, cookie-parser, CORS.
- **Database**: MongoDB, Mongoose with advanced indexing.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or connection URI

### Installation

1. **Clone and Install Dependencies**:
   ```bash
   npm run install:all
   ```
   *(This installs root dependencies and client dependencies)*

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the root directory and update values if needed:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/feature_portal
   JWT_ACCESS_SECRET=your_super_secret_access_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

3. **Running the Application (Concurrent Dev)**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

---

## Creating an Admin Account

To test admin functionality, register a user account through the frontend (`/signup`), then update their role to `admin` in MongoDB Compass or MongoDB shell:
```javascript
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } });
```
