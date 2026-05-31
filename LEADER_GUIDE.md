# 🎯 LEARNSPHERE - Leader's Guide & Project Overview

**Project Lead Role:** Overall coordination & Person 3 (Student Quizzes Module)

---

## 📊 Project Overview

**LearnSphere** is an **e-learning platform** with 3 key modules:

```
┌─────────────────────────────────────────────────────┐
│           LEARNSPHERE APPLICATION                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Person 1              Person 2              Person 3
│  (Auth & Admin)      (Courses & Teaching)  (Quizzes & Learning)
│       │                     │                     │
│       ├─ User Login         ├─ Course Mgmt       ├─ Course Enrollment
│       ├─ Role Management    ├─ Lectures          ├─ Quiz Attempts
│       ├─ Admin Panel        ├─ Assignments       ├─ Submissions
│       └─ Session Control    └─ Progress View     └─ Results & Scores
│                                                     │
└─────────────────────────────────────────────────────┘
         All communicate via Supabase Database
```

---

## 👥 Team Structure & Responsibilities

### **Person 1: Authentication & Admin Module**
**Owner:** [Person 1 Name]

**Responsibilities:**
- ✅ User registration & login system
- ✅ Password reset functionality
- ✅ Admin dashboard for system management
- ✅ User role assignment & permissions
- ✅ Session management

**Files to Build:**
- `src/role/SignUp.js` - Registration/Login UI
- `src/role/AdminDashboard.js` - Admin control panel
- `src/services/auth.js` - Authentication logic
- `src/services/admin.js` - Admin operations

**Key API Endpoints:**
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/forgot-password
GET    /auth/verify-token
GET    /admin/users
PUT    /admin/users/:id/role
DELETE /admin/users/:id
```

---

### **Person 2: Courses & Teaching Module**
**Owner:** [Person 2 Name]

**Responsibilities:**
- ✅ Create & manage courses
- ✅ Upload lectures & learning materials
- ✅ Create assignments & track submissions
- ✅ Manage class sessions
- ✅ View student progress

**Files to Build:**
- `src/role/TeacherDashboard.js` - Teacher control panel
- `src/services/courses.js` - Course management
- `src/services/lecture.js` - Lecture handling
- `src/services/assignment.js` - Assignment logic
- `src/services/session.js` - Class sessions

**Key API Endpoints:**
```
POST   /courses
GET    /courses/:id
PUT    /courses/:id
POST   /courses/:id/lectures
POST   /courses/:id/assignments
GET    /courses/:id/students
GET    /courses/:id/progress
```

---

### **Person 3: Student Learning & Quizzes Module** 👈 **YOUR PERSONAL ROLE**
**Owner:** You (Project Lead)

**Responsibilities:**
- ✅ Course browsing & filtering
- ✅ Enroll in courses
- ✅ Take quizzes with timer
- ✅ Submit assignments
- ✅ Track learning progress
- ✅ View results & scores

**Files to Build:**
- `src/role/StudentDashboard.js` - Student home dashboard
- `src/services/quiz.js` - Quiz logic with timer
- `src/services/enrollment.js` - Course enrollment
- `src/services/assignment.js` - Assignment submission (coordinate with Person 2)

**Key API Endpoints:**
```
GET    /courses (browse all)
POST   /enrollment
GET    /enrollment/:studentId
POST   /quiz/:id/attempt
PUT    /quiz/:id/submit
GET    /quiz/:id/results
POST   /assignment/:id/submit
GET    /student/progress
```

---

## 🗄️ Shared Resources

### **Database (Supabase)**
- Located in: `src/services/supabase.js`
- Person 3 (you) manages all database initialization
- **Tables needed:**
  - `users` (by Person 1)
  - `courses` (by Person 2)
  - `enrollments` (by Person 3)
  - `quizzes` (by Person 3)
  - `quiz_attempts` (by Person 3)
  - `assignments` (shared Person 2 & 3)
  - `submissions` (by Person 3)

### **App Router**
- Located in: `src/App.js`
- Coordinates all three modules
- You'll set up the authentication flow here

---

## 📅 Development Timeline

### **Week 1: Foundation**
- Person 1: Build login/signup UI & basic auth
- Person 3 (You): Set up database schema & Supabase connection
- Person 2: Design course database structure

### **Week 2: Core Features**
- Person 1: Implement role-based access control
- Person 3: Build StudentDashboard & enrollment system
- Person 2: Build TeacherDashboard & course management

### **Week 3: Advanced Features**
- Person 1: Admin dashboard & management
- Person 3: Quiz system with timer & submissions
- Person 2: Assignment & progress tracking

### **Week 4: Integration & Testing**
- All: Test interactions between modules
- All: Bug fixes & optimization
- All: Final deployment

---

## 🔄 How Modules Interact

```
LOGIN (Person 1)
        ↓
    DASHBOARD (Show role-based)
        ↓
   ┌────┴────┐
   ↓         ↓
ADMIN    TEACHER          STUDENT (Person 3 ← You)
(P1)      (P2)              ↓
          ↓            BROWSE COURSES
      CREATE/MANAGE    ↓
      COURSES          ENROLL
      ↓                ↓
      PUBLISH      TAKE QUIZ
      ↓                ├─ Timer
      ↓                ├─ Questions
      PERSON 3 ←──────┤
      ENROLLS          ├─ Submit
                       ↓
                   TRACK RESULTS
```

---

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js (via Supabase)
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Styling:** CSS

---

## 📋 Your Leadership Checklist

### **Before Development Starts:**
- [ ] Brief all team members on their roles
- [ ] Share the task files with each person
- [ ] Set up git branching strategy
- [ ] Create Slack/communication channel
- [ ] Schedule weekly sync meetings

### **During Development:**
- [ ] Daily 15-min standup (check progress)
- [ ] Resolve blocking issues immediately
- [ ] Coordinate API contracts between modules
- [ ] Review code before merging to main

### **Before Deployment:**
- [ ] Integration testing (all modules together)
- [ ] User acceptance testing (UAT)
- [ ] Performance testing
- [ ] Security check
- [ ] Final code review

---

## 🌳 Git Workflow for Team

```bash
# Each person creates feature branch from master
git checkout -b feature/auth-admin        # Person 1
git checkout -b feature/courses-teaching  # Person 2
git checkout -b feature/student-quizzes   # Person 3 (You)

# Regular commit & push
git add .
git commit -m "Feature: [description]"
git push origin feature/[branch-name]

# Create Pull Request for review
# After review & approval → merge to master

# Guidelines:
# - Keep branches clean & focused
# - No force push to master
# - Always test before PR
# - Get at least 1 review before merge
```

---

## 📞 Communication Plan

### **Daily (5-min sync)**
- What each person completed
- Any blockers
- Next day priority

### **Weekly (30-min meeting)**
- Progress review
- Demo of features
- Issues & solutions
- Database schema updates

### **When Integrating Modules**
- Share API endpoint documentation
- Test integration before merging
- Update each other on data format changes

---

## 🎯 Person 3 (Your) Focus Areas

As the project lead handling Person 3's work, focus on:

1. **Week 1:**
   - Set up Supabase connection
   - Design database schema for quizzes & enrollments
   - Create `src/services/supabase.js` configuration

2. **Week 2:**
   - Build StudentDashboard UI
   - Create enrollment system
   - Implement course browsing

3. **Week 3:**
   - Build quiz system with timer
   - Create submission logic
   - Display results & scoring

4. **Week 4:**
   - Integration tests
   - Performance optimization
   - Bug fixes

---

## ✅ Success Criteria

- ✅ All 3 modules working independently
- ✅ Seamless integration between modules
- ✅ Users can login → browse → enroll → take quiz → see results
- ✅ Admin can manage users & courses
- ✅ Teachers can create content & track progress
- ✅ Students can learn & take assessments
- ✅ Zero critical bugs
- ✅ Responsive UI (works on desktop & mobile)

---

## 📞 Quick Reference

| Need | Contact |
|------|---------|
| Auth issues | Person 1 |
| Course/content issues | Person 2 |
| Quiz/enrollment issues | Person 3 (You) |
| Database issues | Person 3 (You) |
| Overall coordination | Project Lead (You) |

---

**Project Lead: Ready to brief your team! 🚀**
