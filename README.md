# FeaturePulse — Feature Request & Public Roadmap Portal

> A production-ready, full-stack customer feedback, upvoting, and public roadmap platform inspired by Canny and Featurebase.

---

## 📖 Project Description

**FeaturePulse** is a modern SaaS feedback management portal that bridges the communication gap between users and product teams. It enables users to submit feature requests, upvote ideas they care about, participate in threaded discussions, and track product development milestones on a real-time Kanban roadmap.

Key product capabilities include:
- **Feature Request Feed**: Search, sort (most upvoted, newest, most discussed), and filter by category or roadmap status.
- **Atomic Upvoting System**: Race-condition-safe upvoting with optimistic client-side updates and automatic rollback.
- **Interactive Discussion Board**: Threaded, nested comments with markdown formatting, author tags, and admin moderation.
- **Interactive Kanban Roadmap**: 3-stage visual development board (`Planned`, `In Progress`, `Completed`) synchronized directly with the database.
- **Admin Management Dashboard**: Complete oversight of all posts and comments, status lifecycles, and key product engagement metrics.
- **Secure Dual-Token Authentication**: Access & Refresh token rotation with `httpOnly` secure cookies and role-based access control (RBAC).

---

## 🛠️ Technology Stack Used

### Frontend
- **Framework**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM (v6)](https://reactrouter.com/)
- **Styling**: [Tailwind CSS (v3)](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/) (with interceptors for automated JWT refresh token rotation)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js (v4)](https://expressjs.com/)
- **Authentication & Security**: [JSON Web Tokens (JWT)](https://jwt.io/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), `cookie-parser`, `cors`
- **Configuration**: `dotenv`
- **Development Tooling**: `nodemon`, `concurrently`

### Database
- **Database Engine**: [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas)
- **ODM**: [Mongoose (v8)](https://mongoosejs.com/) with compound indexing and subdocument referencing

---

## 📦 How to Install Dependencies

The project is configured as a multi-package workspace containing both the Express backend and Vite React frontend.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tanujdarokar/combot_assign.git
   cd combot_assign
   ```

2. **Install all dependencies (Root + Client)**:
   ```bash
   npm run install:all
   ```

   *Alternatively, install them manually:*
   ```bash
   # Install server & root dependencies
   npm install

   # Install client frontend dependencies
   cd client
   npm install
   cd ..
   ```

---

## ⚙️ How to Configure Environment Variables

Create a `.env` file in the root directory by copying the provided `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Port number for Express backend API | `5000` |
| `MONGO_URI` | MongoDB connection string URI | `mongodb://127.0.0.1:27017/feature_portal` |
| `JWT_ACCESS_SECRET` | Secret key used to sign short-lived access tokens (15m) | `your_super_secret_access_key_12345` |
| `JWT_REFRESH_SECRET` | Secret key used to sign long-lived refresh tokens (7d) | `your_super_secret_refresh_key_12345` |
| `CLIENT_URL` | Base URL of the client application (for CORS) | `http://localhost:5173` |
| `NODE_ENV` | Application environment mode (`development` or `production`) | `development` |

---

## 🗄️ Database Setup

Ensure MongoDB is installed and running locally on your machine, or provide a cloud connection string from [MongoDB Atlas](https://www.mongodb.com/atlas).

### 1. Verify MongoDB Service
```bash
# Windows (PowerShell / Services)
Get-Service MongoDB

# macOS / Linux
sudo systemctl status mongod
# or with brew
brew services list
```

### 2. Seed Database with Realistic Demo Data (Optional but Recommended)
A database seeding script is provided to populate initial users (Admin and Regular Users), feature requests across all statuses/categories, and nested comments:

```bash
npm run seed
```

**Default Demo Accounts Created by Seeder:**
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `adminpassword123` |
| **User** | `sarah@example.com` | `userpassword123` |
| **User** | `alex@example.com` | `userpassword123` |

---

## 🚀 How to Run the Project Locally

You can run both the backend API server and frontend client concurrently with a single command:

```bash
npm run dev
```

This starts:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)

### Running Services Separately:
- **Backend Only**:
  ```bash
  npm run server
  ```
- **Frontend Only**:
  ```bash
  npm run client
  ```

---

## 📌 Assumptions and Limitations

### Assumptions
1. **Local Authentication Cookies**: `refreshToken` is transmitted as an `httpOnly` cookie. In local development (`NODE_ENV=development`), the `secure` flag is set to `false` to permit standard HTTP localhost traffic. In production, this flag automatically toggles to `true` requiring HTTPS.
2. **Atomic Upvote Integrity**: It is assumed that an upvote is a binary toggle per user per post. MongoDB's `$addToSet` and `$pull` operators ensure race-condition safety even under rapid parallel clicks.
3. **Database Availability**: The application assumes an accessible MongoDB instance on startup. If the database connection fails, the server exits with an informative error log.

### Limitations
1. **Password Reset Flow (Simulation Mode)**: To avoid requiring external third-party SMTP service credentials (e.g. SendGrid / AWS SES) during evaluation, the password reset endpoint securely generates a cryptographic SHA-256 token and returns it in the API response, allowing direct simulation and testing via `/reset-password?token=<TOKEN>`.
2. **File & Image Attachments**: Current feature requests and comments support rich Markdown text; direct binary image file uploads (e.g. via AWS S3 / Cloudinary) are not currently implemented.
3. **Email Verification**: User registration flags `isEmailVerified` as `true` by default for instant onboarding during local evaluation.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
