# 🎓 LearnSphere - Comprehensive E-Learning Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-Active-brightgreen)
![License](https://img.shields.io/badge/license-ISC-blue)

A full-stack e-learning platform designed to provide seamless educational experiences for administrators, instructors, and students. LearnSphere offers course management, quiz assessments, progress tracking, and interactive learning tools.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Team & Contributors](#team--contributors)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**LearnSphere** is a comprehensive e-learning management system built with modern web technologies. It provides a complete ecosystem for:

- **Administrators**: Manage users, courses, analytics, and platform settings
- **Instructors**: Create courses, upload lectures, manage assignments, and track student progress
- **Students**: Enroll in courses, take quizzes, submit assignments, and monitor learning progress

The platform integrates real-time messaging, progress tracking, payment processing, and detailed analytics.

---

## ✨ Key Features

### 👤 Authentication & Authorization
- Secure user authentication with JWT tokens
- Role-based access control (Admin, Instructor, Student)
- User session management
- Password hashing with bcrypt

### 📚 Course Management
- Create and manage courses
- Upload lectures with multimedia support
- Assign course materials and resources
- Course enrollment system
- Progress tracking per course

### 📝 Quiz & Assessment System
- Create and manage quizzes with multiple question types
- Timed quiz assessments
- Auto-submission on time expiry
- Progress tracking with question indicators
- Score calculation and result analytics
- Attempt history

### 💬 Communication
- Real-time messaging between users
- Discussion threads
- Notifications system

### 📊 Analytics & Reporting
- Admin analytics dashboard
- Student performance metrics
- Course completion rates
- Quiz attempt statistics
- User engagement tracking

### 💳 Payment Integration
- Razorpay payment gateway integration
- Course enrollment with payment processing
- Transaction history

### 📱 Responsive Design
- Mobile-friendly interface
- Cross-browser compatibility
- Adaptive layouts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.4
- **Routing**: React Router 7.13.2
- **UI Components**: React Icons 5.6.0
- **Charts**: Recharts 3.8.1
- **Backend Integration**: Supabase JS 2.99.2
- **Build Tool**: Create React App with Webpack

### Backend
- **Server**: Express.js 4.18.2
- **Language**: Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma 5.0.0
- **Authentication**: JWT (jsonwebtoken 9.0.0)
- **Security**: bcrypt 5.1.0
- **CORS**: cors 2.8.5
- **Environment**: dotenv 16.0.3
- **Payments**: Razorpay 2.9.6
- **Dev Tools**: Nodemon 2.0.20

### Database
- **Primary DB**: PostgreSQL
- **Authentication Backend**: Supabase
- **ORM Migrations**: Prisma Migrations

---

## 📦 Prerequisites

Before setting up LearnSphere, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (v6 or higher) - Comes with Node.js
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Create Free Account](https://supabase.com/)
- **Razorpay Account** (for payment testing) - [Sign Up](https://razorpay.com/)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd learnsphere
```

### Step 2: Setup PostgreSQL Database

1. **Install PostgreSQL** from the [official website](https://www.postgresql.org/download/windows/)
   - Remember the password you set for the `postgres` user
   - Default port: 5432

2. **Create the database**:
   ```bash
   psql -U postgres
   ```
   
   Then run:
   ```sql
   CREATE DATABASE learnsphere_db;
   \q
   ```

### Step 3: Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/learnsphere_db"
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Run Prisma migrations:

```bash
npx prisma migrate deploy
```

(Optional) Seed the database:

```bash
node seed.js
```

### Step 4: Setup Frontend

```bash
cd ..
npm install
```

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_supabase_public_key
```

---

## 🏃 Running the Application

### Option 1: Using PowerShell (Windows)

```bash
.\start-dev.ps1
```

This script will:
- Start the backend server on port 5000
- Start the frontend development server on port 3000

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs (if available)

---

## 📁 Project Structure

```
learnsphere/
├── backend/                          # Node.js/Express Backend
│   ├── middleware/                   # Express middleware (auth, etc.)
│   │   └── auth.js                   # JWT authentication
│   ├── prisma/                       # Database schema & migrations
│   │   ├── schema.prisma             # Prisma data model
│   │   └── migrations/               # Database version history
│   ├── routes/                       # API routes
│   │   ├── admin.js                  # Admin management endpoints
│   │   ├── auth.js                   # Authentication endpoints
│   │   ├── courses.js                # Course management
│   │   ├── enrollments.js            # Enrollment management
│   │   ├── lectures.js               # Lecture management
│   │   ├── messages.js               # Messaging system
│   │   ├── payments.js               # Payment processing
│   │   ├── progress.js               # Student progress tracking
│   │   └── quizzes.js                # Quiz management
│   ├── server.js                     # Express server entry point
│   ├── seed.js                       # Database seeding script
│   ├── package.json                  # Backend dependencies
│   └── SETUP.md                      # Backend setup guide
│
├── src/                              # React Frontend
│   ├── api/                          # API client
│   │   └── apiClient.js              # Axios/Fetch configuration
│   ├── context/                      # React Context
│   │   └── AuthContext.js            # Authentication context
│   ├── pages/                        # Page components
│   │   ├── Login.js                  # Login page
│   │   ├── QuizTake.js               # Quiz taking interface
│   │   └── ...                       # Other pages
│   ├── role/                         # Role-based components
│   │   ├── AdminDashboard.js         # Admin panel
│   │   ├── AdminAnalytics.js         # Analytics dashboard
│   │   ├── InstructorDashboard.js    # Instructor panel
│   │   ├── StudentDashboard.js       # Student panel
│   │   ├── QuizList.js               # Quiz listing
│   │   ├── QuizHistory.js            # Student quiz history
│   │   ├── Messaging.js              # Messaging interface
│   │   └── ...                       # Other role components
│   ├── services/                     # API service layer
│   │   ├── auth.js                   # Auth API calls
│   │   ├── courses.js                # Course API calls
│   │   ├── quiz.js                   # Quiz API calls
│   │   ├── admin.js                  # Admin API calls
│   │   └── ...                       # Other services
│   ├── App.js                        # Main App component
│   ├── index.js                      # React entry point
│   └── package.json                  # Frontend dependencies
│
├── public/                           # Static assets
├── build/                            # Production build output
├── README.md                         # This file
├── LEADER_GUIDE.md                   # Project leadership guide
├── QUIZ_ENHANCEMENT.md               # Quiz feature details
└── start-dev.ps1                     # Development startup script

```

---

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### Course Endpoints
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course (Admin/Instructor)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Quiz Endpoints
- `GET /api/quizzes` - List quizzes
- `POST /api/quizzes` - Create quiz
- `POST /api/quizzes/:id/attempt` - Start quiz attempt
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/:id/results` - Get quiz results

### Enrollment Endpoints
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments` - List enrollments
- `GET /api/enrollments/:id` - Get enrollment details

### Progress Endpoints
- `GET /api/progress/:courseId` - Get course progress
- `POST /api/progress/update` - Update progress

### Admin Endpoints
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

---

## 💻 Development Guide

### Code Style & Standards
- Follow ESLint configuration
- Use functional components in React
- Maintain consistent file naming (camelCase for JS files)
- Write meaningful commit messages

### Creating New Features

1. **Backend API Route**:
   ```javascript
   // backend/routes/newfeature.js
   const express = require('express');
   const router = express.Router();
   
   router.get('/', (req, res) => {
     res.json({ message: 'New feature' });
   });
   
   module.exports = router;
   ```

2. **Frontend Service**:
   ```javascript
   // src/services/newfeature.js
   import apiClient from '../api/apiClient';
   
   export const getNewFeature = () => {
     return apiClient.get('/newfeature');
   };
   ```

3. **React Component**:
   ```javascript
   // src/role/NewFeature.js
   import React, { useState, useEffect } from 'react';
   import { getNewFeature } from '../services/newfeature';
   
   export default function NewFeature() {
     const [data, setData] = useState(null);
     
     useEffect(() => {
       getNewFeature().then(res => setData(res.data));
     }, []);
     
     return <div>{/* Component JSX */}</div>;
   }
   ```

### Building for Production

Frontend:
```bash
npm run build
```

This creates optimized production build in the `build/` folder.

Backend:
- Set `NODE_ENV=production` in `.env`
- Ensure database is properly backed up
- Deploy using preferred hosting service

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 👥 Team & Contributors

**Project Structure**:
- **Person 1**: Authentication & Admin Module
- **Person 2**: Courses & Teaching Module  
- **Person 3**: Quizzes & Student Learning Module

See [LEADER_GUIDE.md](./LEADER_GUIDE.md) for detailed team responsibilities.

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**
- Verify PostgreSQL is running: `psql --version`
- Check DATABASE_URL in `.env`
- Ensure password is correct
- Run: `npx prisma db push`

**Port Already in Use**
- Change PORT in `.env`
- Kill process: `netstat -ano | findstr :5000` (Windows)

**Missing Dependencies**
```bash
cd backend
npm install
```

### Frontend Issues

**Module not found**
```bash
npm install
```

**API Connection Error**
- Verify backend is running on correct port
- Check REACT_APP_API_URL in `.env`
- Ensure CORS is configured in backend

**Build Fails**
```bash
npm cache clean --force
rm -r node_modules
npm install
npm run build
```

### Prisma Issues

**Reset Database**
```bash
npx prisma migrate reset
node seed.js
```

**Update Schema**
```bash
npx prisma migrate dev --name migration_name
```

---

## 📝 License

This project is licensed under the ISC License.

---

## 💡 Support

For issues, questions, or suggestions, please:
1. Check existing documentation in [LEADER_GUIDE.md](./LEADER_GUIDE.md)
2. Review [QUIZ_ENHANCEMENT.md](./QUIZ_ENHANCEMENT.md) for feature details
3. Consult [SETUP.md](./backend/SETUP.md) for setup troubleshooting

---

**Last Updated**: June 2026 | **Current Version**: 1.0.0
