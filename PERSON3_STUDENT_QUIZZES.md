# Person 3: Student Features & Quizzes 🎓

## 📋 Overview
You'll build the student dashboard and quiz system including course browsing, enrollment, quiz attempts, and progress tracking.

---

## 📁 Files You'll Work With

### Backend Services
- `src/services/quiz.js` - Quiz CRUD & attempt management
- `src/services/enrollment.js` - Student course enrollment
- `src/services/courses.js` - Browse available courses (read operations)
- `src/services/supabase.js` - Database connection

### Frontend Components
- `src/role/StudentDashboard.js` - Main student interface
- `src/App.js` - Route setup for student routes

### Styling
- `src/role/StudentDashboard.css` - Dashboard styling

---

## 🎯 Key Features to Implement

### 1. Course Discovery & Enrollment
- [ ] **Browse Courses** - View all available courses
- [ ] **Course Details** - See description, teacher, duration, ratings
- [ ] **Search & Filter** - Filter by category, difficulty, rating
- [ ] **Enroll Course** - Join a course
- [ ] **Unenroll** - Leave a course
- [ ] **My Courses** - View enrolled courses
- [ ] **Progress Bar** - Show completion percentage per course

### 2. Quiz Management & Attempts
- [ ] **View Quizzes** - See all quizzes for enrolled courses
- [ ] **Start Quiz** - Begin quiz attempt
- [ ] **Timer** - Show countdown timer (auto-submit on timeout)
- [ ] **Question Types** - Support multiple choice, true/false, short answer
- [ ] **Save Progress** - Auto-save answers
- [ ] **Submit Quiz** - Final submission
- [ ] **Retake Quiz** - Allow multiple attempts (based on teacher settings)
- [ ] **View Score** - See results after submission

### 3. Assignment Management
- [ ] **View Assignments** - See all assignments for courses
- [ ] **Assignment Details** - Deadline, requirements, rubric
- [ ] **Upload Submission** - Submit files for assignments
- [ ] **Check Status** - Pending, submitted, graded
- [ ] **View Feedback** - See teacher's feedback & score
- [ ] **Resubmit** - Allow resubmission before deadline

### 4. Learning Materials
- [ ] **View Lectures** - Watch videos or read PDFs
- [ ] **Mark as Read** - Track lecture completion
- [ ] **Download Materials** - Download course materials
- [ ] **Notes** - Take notes while watching lectures
- [ ] **Progress** - See which lectures completed

### 5. Grades & Performance
- [ ] **View Grades** - All grades from quizzes, assignments, discussions
- [ ] **GPA Calculator** - Calculate overall GPA
- [ ] **Performance Report** - Stats on strengths/weaknesses
- [ ] **Grade Breakdown** - Show how grades are calculated
- [ ] **Compare to Class** - See how you rank (anonymous)

### 6. Dashboard & Analytics
- [ ] **Summary Card** - Active courses, pending assignments
- [ ] **Recent Activity** - New courses, quiz results, feedback
- [ ] **Upcoming Deadlines** - Calendar view of due dates
- [ ] **Completion Stats** - Courses completed, quizzes taken
- [ ] **Time Spent** - Track learning hours per course

### 7. Notifications
- [ ] **Assignment Reminders** - Notify before deadline
- [ ] **Grade Updates** - Alert when graded
- [ ] **Class Alerts** - New materials, session reminders
- [ ] **Message Notifications** - Teacher communications

---

## 📚 Technologies to Learn

### Frontend
```javascript
- React Hooks (useState, useEffect, useContext)
- React Router (student routes)
- Form handling (file uploads for assignments)
- Timer components (countdown for quizzes)
- Calendar libraries
- Charts (progress visualization)
```

### Backend (Supabase)
```javascript
- PostgreSQL queries (enrollments, quiz attempts)
- Tables: enrollments, quiz_attempts, submissions
- Relationships & joins
- Aggregation (calculate GPA, stats)
- Real-time data updates
```

### Data Structures
- Quiz attempt tracking
- Answer storage (secure)
- Score calculations
- Progress calculations

---

## 🔗 Dependencies

```json
{
  "@supabase/supabase-js": "^2.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "react-icons": "^4.x",
  "date-fns": "^2.x",
  "chart.js": "^3.x",
  "react-calendar": "^4.x"
}
```

---

## 📝 Learning Path

1. **Week 1**: Learn database schema (enrollments, quiz_attempts)
2. **Week 2**: Implement course browsing & enrollment
3. **Week 3**: Build quiz attempt system (timer, questions)
4. **Week 4**: Implement auto-saving & quiz submission
5. **Week 5**: Build assignment submission interface
6. **Week 6**: Create grades & performance dashboard
7. **Week 7**: Add notifications & calendar
8. **Week 8**: Testing & optimization

---

## 📝 Database Schema

```sql
-- Table: enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  student_id UUID,
  course_id UUID,
  enrolled_at TIMESTAMP,
  progress_percentage INT,
  UNIQUE(student_id, course_id)
);

-- Table: quiz_attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY,
  student_id UUID,
  quiz_id UUID,
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  score INT,
  total_questions INT,
  attempt_number INT
);

-- Table: quiz_answers
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY,
  attempt_id UUID,
  question_id UUID,
  student_answer TEXT,
  is_correct BOOLEAN,
  points_earned INT
);

-- Table: course_progress
CREATE TABLE course_progress (
  id UUID PRIMARY KEY,
  student_id UUID,
  course_id UUID,
  lectures_completed INT,
  total_lectures INT,
  quizzes_taken INT,
  assignments_submitted INT,
  current_gpa DECIMAL
);

-- Table: student_grades
CREATE TABLE student_grades (
  id UUID PRIMARY KEY,
  student_id UUID,
  course_id UUID,
  quiz_avg DECIMAL,
  assignment_avg DECIMAL,
  participation INT,
  final_grade DECIMAL
);
```

---

## 📞 Key Functions to Create

```javascript
// courses.js (read operations)
- getAllCourses()
- searchCourses(query, filters)
- getCourseDetails(courseId)

// enrollment.js
- enrollCourse(studentId, courseId)
- getStudentCourses(studentId)
- unenrollCourse(studentId, courseId)
- getEnrollmentProgress(studentId, courseId)

// quiz.js
- getQuizzesForCourse(courseId)
- startQuizAttempt(studentId, quizId)
- saveAnswer(attemptId, questionId, answer)
- submitQuizAttempt(attemptId)
- getAttemptResults(attemptId)
- getQuizAttempts(studentId, quizId)

// Student Dashboard
- showEnrolledCourses()
- showUpcomingDeadlines()
- calculateGPA()
- displayPerformanceStats()
- showQuizResults()
- getNotifications()
```

---

## 🧪 Testing Checklist

- [ ] Can browse courses
- [ ] Can search & filter courses
- [ ] Can enroll in course
- [ ] My courses list shows enrolled courses
- [ ] Can see course materials
- [ ] Can mark lectures complete
- [ ] Can start quiz
- [ ] Timer works & auto-submits
- [ ] Answers auto-save
- [ ] Can submit quiz & see score
- [ ] Can retake quiz (if allowed)
- [ ] Can submit assignment
- [ ] Can view feedback on submission
- [ ] Grades display correctly
- [ ] GPA calculated correctly
- [ ] Dashboard shows stats
- [ ] Notifications work
- [ ] Calendar shows deadlines

---

## 💡 Tips

- **Quiz Security**: Don't send answers to client before submission
- **Timer**: Use server-side timeout validation, not just client
- **Auto-save**: Save every 30 seconds during quiz/assignment
- **Offline Support**: Allow offline answer saving, sync when online
- **Progress**: Calculate & cache progress to avoid recalculation
- **Performance**: Paginate courses list, lazy load course content

---

## 🔒 Security Considerations

- Only students can access their own grades
- Prevent quiz answer peeking before submission
- Validate submissions server-side, not just client
- Check enrollment before allowing course access
- Prevent backdating submissions
- Secure quiz timer (server validates)

---

## 🚀 Getting Started

1. Create branch: `git checkout -b feature/student-quizzes`
2. Study database schema above
3. Start with `enrollment.js` and course browsing
4. Then build quiz attempt system
5. Add assignment submissions
6. Finally build dashboard & analytics

**Need help?** See:
- Supabase Docs: https://supabase.com/docs
- Quiz best practices: https://www.notion.so/Quiz-Best-Practices
- Person 2's guide (for course structure): PERSON2_TEACHER_COURSES.md
