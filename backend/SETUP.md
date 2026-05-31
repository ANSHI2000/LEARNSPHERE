# LearnSphere Backend - Setup Instructions

## 📋 Quick Setup

### Step 1: Install PostgreSQL
**Download and install from:** https://www.postgresql.org/download/windows/

During installation:
- Default port: 5432
- Set password for `postgres` user (remember it!)
- Install pgAdmin (comes with it)

**Verify installation:**
```bash
psql --version
```

---

### Step 2: Create Database
Open PowerShell and run:
```bash
psql -U postgres
```

You'll see the PostgreSQL prompt. Then paste:
```sql
CREATE DATABASE learnsphere_db;
\q
```

**Expected output:**
```
CREATE DATABASE
```

---

### Step 3: Update .env with PostgreSQL Password
**File:** `d:\learnsphere\backend\.env`

Change this line:
```
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/learnsphere_db"
```

Replace `PASSWORD` with your PostgreSQL password from Step 1!

---

### Step 4: Install Backend Dependencies
Open PowerShell and run:
```bash
cd d:\learnsphere\backend
npm install
```

This will install all required packages from `package.json`

---

### Step 5: Setup Database (Run Migrations)
Still in the backend folder:
```bash
npx prisma migrate dev --name init
```

**What this does:**
- Creates all database tables
- Sets up relationships
- Creates indexes

**Expected output:**
```
✔ Your database is now in sync with your schema.
```

---

### Step 6: Start Backend Server
```bash
npm run dev
```

**Expected output:**
```
🚀 LearnSphere Backend Running!
================================
Server: http://localhost:5000
Health Check: http://localhost:5000/api/health
Environment: development
================================
```

✅ **Backend is now running!**

---

### Step 7: Test Backend (Optional)
Open browser and visit:
```
http://localhost:5000/api/health
```

Should show:
```json
{
  "message": "Backend is running!",
  "timestamp": "2024-03-31T10:00:00.000Z"
}
```

---

### Step 8: In Another Terminal - Start React Frontend
```bash
cd d:\learnsphere
npm start
```

**Expected:** React app opens at `http://localhost:3000`

---

## 📂 Backend Folder Structure

```
backend/
├── routes/           # API endpoints
│   ├── auth.js      # Login/Register
│   ├── courses.js   # Course management
│   ├── lectures.js  # Video lectures
│   ├── enrollments.js # Student enrollment
│   ├── progress.js  # Learning progress
│   ├── quizzes.js   # Quiz management
│   └── admin.js     # Admin analytics
├── middleware/      # Authentication
│   └── auth.js      # JWT verification & role check
├── prisma/          # Database
│   └── schema.prisma # Database structure
├── server.js        # Main server file
├── package.json     # Dependencies
└── .env             # Configuration
```

---

## 🔌 API Endpoints Overview

### Auth
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login to get JWT token

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get single course details
- `POST /api/courses` - Create new course (Instructor)
- `POST /api/courses/:id/publish` - Publish course

### Lectures
- `POST /api/lectures` - Add lecture to course
- `GET /api/lectures/course/:courseId` - Get all lectures
- `GET /api/lectures/:id` - Get single lecture

### Enrollment
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/my-courses` - Get enrolled courses
- `GET /api/enrollments/check/:courseId` - Check if enrolled

### Progress
- `POST /api/progress` - Update lecture progress
- `GET /api/progress/course/:courseId` - Get course progress
- `GET /api/progress/course/:courseId/resume` - Get last watched video

### Quizzes
- `POST /api/quizzes` - Create quiz
- `POST /api/quizzes/:quizId/questions` - Add quiz question
- `POST /api/quizzes/attempt` - Submit quiz attempt
- `GET /api/quizzes/:id` - Get quiz details

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/courses` - All courses

---

## 🧪 Test API with Postman/Insomnia

### 1. Register a Student
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "email": "student@test.com",
  "name": "John Student",
  "password": "password123",
  "role": "student"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "student@test.com",
  "password": "password123"
}
```

Response will include `token` → copy this token!

### 3. Get All Courses
```
GET http://localhost:5000/api/courses
```

### 4. Protected Route (needs token)
```
GET http://localhost:5000/api/enrollments/my-courses
Headers:
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ⚠️ Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
**Problem:** PostgreSQL not running
**Fix:** Start PostgreSQL service from Windows Services or run `psql -U postgres`

### Error: "relation 'User' does not exist"
**Problem:** Database migration not run
**Fix:** Run `npx prisma migrate dev --name init`

### Error: "jwt malformed"
**Problem:** Invalid token format
**Fix:** Make sure token is passed correctly: `Authorization: Bearer TOKEN`

### Error: "role not found"
**Problem:** User role doesn't match requirement
**Fix:** Admin endpoints need `role: "admin"`, Instructor endpoints need `role: "instructor"`

---

## ✨ Next Steps

1. ✅ Backend is running
2. 📱 Connect React frontend (already done via `apiClient.js`)
3. 🎨 Create login/dashboard UI components
4. 📡 Test API calls in React

**You're 60% done! 🎉**

Stay consistent, test often, and you'll have a working platform!
