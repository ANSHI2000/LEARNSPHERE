# Person 2: Teacher Features & Courses 👨‍🏫

## 📋 Overview
You'll build the teacher dashboard and all course management features including lectures, assignments, and sessions.

---

## 📁 Files You'll Work With

### Backend Services
- `src/services/courses.js` - Course CRUD operations
- `src/services/lecture.js` - Lecture/video content management
- `src/services/assignment.js` - Assignment creation & grading
- `src/services/session.js` - Class session management
- `src/services/supabase.js` - Database connection

### Frontend Components
- `src/role/TeacherDashboard.js` - Main teacher interface
- `src/App.js` - Route setup for teacher routes

### Styling
- `src/role/TeacherDashboard.css` - Dashboard styling

---

## 🎯 Key Features to Implement

### 1. Course Management
- [ ] **Create Course** - Add new course with title, description, category
- [ ] **Edit Course** - Update course details
- [ ] **Delete Course** - Remove course
- [ ] **List Courses** - View all courses created by teacher
- [ ] **Publish Course** - Make course visible to students
- [ ] **Course Settings** - Difficulty level, prerequisites, capacity

### 2. Lecture Management
- [ ] **Upload Lectures** - Add video/PDF content
- [ ] **Organize by Week** - Structure lectures in modules/weeks
- [ ] **Add Descriptions** - Add notes for each lecture
- [ ] **Mark as Complete** - Students can mark lectures done
- [ ] **View Statistics** - See how many students watched

### 3. Assignment Management
- [ ] **Create Assignment** - Add assignment with title, description, deadline
- [ ] **Set Rubric** - Define grading criteria
- [ ] **View Submissions** - See all student submissions
- [ ] **Grade Assignment** - Give marks & feedback
- [ ] **Send Reminders** - Notify students about deadlines

### 4. Quiz Management
- [ ] **Create Quizzes** - Structure questions
- [ ] **Set Timer** - Limit quiz duration
- [ ] **Auto-grade** - Calculate scores (integrate with Person 3)
- [ ] **View Results** - See student performance

### 5. Class Sessions
- [ ] **Schedule Session** - Set live class time
- [ ] **Generate Meet Link** - Create Zoom/Google Meet link
- [ ] **Record Session** - Save recordings
- [ ] **Attendance** - Track who attended
- [ ] **Send Notifications** - Remind students before class

### 6. Analytics & Reports
- [ ] **Student Progress** - Track completion rates
- [ ] **Class Statistics** - Average scores, grades
- [ ] **Engagement Metrics** - Who's active, who's behind
- [ ] **Export Reports** - Generate PDF/CSV

---

## 📚 Technologies to Learn

### Frontend
```javascript
- React Components & Hooks
- Form handling (file uploads, date pickers)
- Modal/popup dialogs
- Data tables (displaying submissions)
- Chart libraries (Chart.js or similar for stats)
```

### Backend (Supabase)
```javascript
- PostgreSQL database design
- Tables: courses, lectures, assignments, submissions
- File storage (for uploading PDFs/videos)
- Relationships (foreign keys)
- Real-time updates (websockets)
```

### Third-party APIs
- Google Drive/AWS S3 (file storage)
- Google Meet/Zoom API (video sessions)
- Email service (notifications)

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
  "react-chartjs-2": "^4.x"
}
```

---

## 📝 Learning Path

1. **Week 1**: Learn database schema design (courses, lectures, assignments)
2. **Week 2**: Build course CRUD operations
3. **Week 3**: Implement lecture upload & management
4. **Week 4**: Create assignment submission system
5. **Week 5**: Build grading interface
6. **Week 6**: Add session scheduling & notifications
7. **Week 7**: Build analytics dashboard
8. **Week 8**: Integration testing & optimization

---

## 📝 Database Schema

```sql
-- Table: courses
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  teacher_id UUID,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  is_published BOOLEAN,
  created_at TIMESTAMP
);

-- Table: lectures
CREATE TABLE lectures (
  id UUID PRIMARY KEY,
  course_id UUID,
  title VARCHAR(255),
  content_url VARCHAR(500),
  week_number INT,
  created_at TIMESTAMP
);

-- Table: assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY,
  course_id UUID,
  title VARCHAR(255),
  description TEXT,
  deadline TIMESTAMP,
  max_score INT,
  rubric TEXT
);

-- Table: submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  assignment_id UUID,
  student_id UUID,
  file_url VARCHAR(500),
  submitted_at TIMESTAMP,
  score INT,
  feedback TEXT
);

-- Table: sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  course_id UUID,
  scheduled_time TIMESTAMP,
  meet_link VARCHAR(500),
  recording_url VARCHAR(500)
);
```

---

## 📞 Key Functions to Create

```javascript
// courses.js
- createCourse(courseData)
- updateCourse(courseId, courseData)
- deleteCourse(courseId)
- getTeacherCourses(teacherId)
- publishCourse(courseId)

// lecture.js
- uploadLecture(courseId, file, description)
- getLectures(courseId)
- deleteLecture(lectureId)

// assignment.js
- createAssignment(courseId, assignmentData)
- getAssignments(courseId)
- getSubmissions(assignmentId)
- gradeSubmission(submissionId, score, feedback)

// session.js
- scheduleSession(courseId, dateTime, meetLink)
- getSessions(courseId)
- recordAttendance(sessionId, studentId)

// Teacher Dashboard
- showCourseDashboard()
- displayStudentProgress()
- showGradingQueue()
- displayAnalytics()
```

---

## 🧪 Testing Checklist

- [ ] Can create new course
- [ ] Can upload lectures
- [ ] Can create assignments with rubric
- [ ] Can grade student submissions
- [ ] Can schedule live sessions
- [ ] Can view student progress
- [ ] Can export reports
- [ ] Notifications sent to students
- [ ] File uploads work (PDFs, videos)
- [ ] Session links generated correctly

---

## 💡 Tips

- Use Supabase Storage for file uploads
- Consider caching course data for performance
- Implement pagination for large submission lists
- Add real-time updates for live grading
- Create templates for common assignment types

---

## 🚀 Getting Started

1. Create branch: `git checkout -b feature/teacher-courses`
2. Study database schema above
3. Start with `courses.js` and course creation
4. Then move to lectures, assignments, sessions
5. Finally build the dashboard UI

**Need help?** Check Supabase docs: https://supabase.com/docs
