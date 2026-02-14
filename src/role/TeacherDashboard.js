import React, { useState } from 'react';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Introduction to React',
      description: 'Learn the basics of React including components, hooks, and state management.',
      category: 'Computer Science',
      level: 'Beginner',
      duration: '8 weeks',
      students: 45,
      status: 'published',
      thumbnail: 'https://via.placeholder.com/300x200',
      lectures: [
        { id: 1, title: 'Getting Started with React', duration: '15:30', videoUrl: '#' },
        { id: 2, title: 'Components and Props', duration: '20:45', videoUrl: '#' },
        { id: 3, title: 'State and Lifecycle', duration: '18:20', videoUrl: '#' }
      ],
      quizzes: [
        { id: 1, title: 'React Basics Quiz', questions: 10, attempts: 32 },
        { id: 2, title: 'Components Quiz', questions: 8, attempts: 28 }
      ],
      assignments: [
        { id: 1, title: 'Build a Todo App', submissions: 38, dueDate: '2024-04-15' },
        { id: 2, title: 'Create a Counter Component', submissions: 42, dueDate: '2024-04-10' }
      ]
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      description: 'Master advanced JavaScript concepts including closures, promises, and async/await.',
      category: 'Programming',
      level: 'Advanced',
      duration: '10 weeks',
      students: 32,
      status: 'draft',
      thumbnail: 'https://via.placeholder.com/300x200',
      lectures: [
        { id: 1, title: 'Closures and Scope', duration: '25:30', videoUrl: '#' },
        { id: 2, title: 'Promises and Async/Await', duration: '30:15', videoUrl: '#' }
      ],
      quizzes: [
        { id: 1, title: 'JavaScript Advanced Quiz', questions: 15, attempts: 20 }
      ],
      assignments: [
        { id: 1, title: 'Implement Promise Methods', submissions: 25, dueDate: '2024-04-20' }
      ]
    }
  ]);

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    duration: '',
    thumbnail: '',
    status: 'draft'
  });

  const [newLecture, setNewLecture] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    courseId: null
  });

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    questions: [],
    courseId: null
  });

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100,
    courseId: null
  });

  const [sessions, setSessions] = useState([
    {
      id: 1,
      title: 'React Hooks Workshop',
      course: 'Introduction to React',
      date: '2024-04-10',
      time: '14:00',
      duration: '60 min',
      attendees: 23,
      status: 'scheduled',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 2,
      title: 'JavaScript Debugging Session',
      course: 'Advanced JavaScript',
      date: '2024-04-12',
      time: '15:30',
      duration: '90 min',
      attendees: 15,
      status: 'scheduled',
      meetingLink: 'https://meet.google.com/klm-nopq-rst'
    }
  ]);

  const [newSession, setNewSession] = useState({
    title: '',
    course: '',
    date: '',
    time: '',
    duration: '',
    meetingLink: ''
  });

  const handleCreateCourse = () => {
    const course = {
      id: courses.length + 1,
      ...newCourse,
      students: 0,
      lectures: [],
      quizzes: [],
      assignments: []
    };
    setCourses([...courses, course]);
    setNewCourse({
      title: '',
      description: '',
      category: '',
      level: 'Beginner',
      duration: '',
      thumbnail: '',
      status: 'draft'
    });
    setShowCreateCourse(false);
  };

  const handleAddLecture = (courseId) => {
    if (newLecture.title && newLecture.videoUrl) {
      setCourses(courses.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            lectures: [...course.lectures, { ...newLecture, id: course.lectures.length + 1 }]
          };
        }
        return course;
      }));
      setNewLecture({ title: '', description: '', videoUrl: '', duration: '', courseId: null });
    }
  };

  const handleAddQuiz = (courseId) => {
    if (newQuiz.title) {
      setCourses(courses.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            quizzes: [...course.quizzes, { 
              id: course.quizzes.length + 1, 
              title: newQuiz.title,
              questions: 0,
              attempts: 0
            }]
          };
        }
        return course;
      }));
      setNewQuiz({ title: '', description: '', questions: [], courseId: null });
    }
  };

  const handleAddAssignment = (courseId) => {
    if (newAssignment.title && newAssignment.dueDate) {
      setCourses(courses.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            assignments: [...course.assignments, {
              id: course.assignments.length + 1,
              title: newAssignment.title,
              submissions: 0,
              dueDate: newAssignment.dueDate
            }]
          };
        }
        return course;
      }));
      setNewAssignment({ title: '', description: '', dueDate: '', totalPoints: 100, courseId: null });
    }
  };

  const handleScheduleSession = () => {
    if (newSession.title && newSession.course && newSession.date && newSession.time) {
      const session = {
        id: sessions.length + 1,
        ...newSession,
        attendees: 0,
        status: 'scheduled'
      };
      setSessions([...sessions, session]);
      setNewSession({
        title: '',
        course: '',
        date: '',
        time: '',
        duration: '',
        meetingLink: ''
      });
    }
  };

  const handleToggleCourseStatus = (courseId) => {
    setCourses(courses.map(course =>
      course.id === courseId
        ? { ...course, status: course.status === 'published' ? 'draft' : 'published' }
        : course
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  return (
    <div className="teacher-dashboard">
      <div className="teacher-sidebar">
        <div className="sidebar-header">
          <h2>Teacher Panel</h2>
          <p>Welcome, Instructor</p>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📚 My Courses
          </button>
          <button 
            className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('create');
              setShowCreateCourse(true);
            }}
          >
            ➕ Create Course
          </button>
          <button 
            className={`nav-btn ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            🎥 Live Sessions
          </button>
          <button 
            className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Course Analytics
          </button>
          <button 
            className={`nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👥 My Students
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="teacher-main">
        {activeTab === 'courses' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>My Courses</h2>
              <button 
                className="create-btn"
                onClick={() => {
                  setActiveTab('create');
                  setShowCreateCourse(true);
                }}
              >
                + Create New Course
              </button>
            </div>

            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                  <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                      <span className={`course-status ${course.status}`}>
                        {course.status}
                      </span>
                      <span>{course.students} students</span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="course-actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => setSelectedCourse(course)}
                      >
                        Edit
                      </button>
                      <button 
                        className={`action-btn ${course.status === 'published' ? 'unpublish' : 'publish'}`}
                        onClick={() => handleToggleCourseStatus(course.id)}
                      >
                        {course.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && showCreateCourse && (
          <div className="tab-content">
            <h2>Create New Course</h2>
            <div className="create-course-form">
              <div className="form-group">
                <label>Course Title</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="e.g., Introduction to Python"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Course description..."
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Literature">Literature</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    placeholder="e.g., 8 weeks"
                  />
                </div>

                <div className="form-group">
                  <label>Thumbnail URL</label>
                  <input
                    type="text"
                    value={newCourse.thumbnail}
                    onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                    placeholder="Image URL"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setShowCreateCourse(false)}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleCreateCourse}>
                  Create Course
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedCourse && (
          <div className="tab-content course-details">
            <div className="tab-header">
              <h2>{selectedCourse.title} - Course Management</h2>
              <button className="close-btn" onClick={() => setSelectedCourse(null)}>✕</button>
            </div>

            <div className="course-sections">
              <div className="course-section">
                <h3>Video Lectures</h3>
                <div className="section-content">
                  {selectedCourse.lectures.map(lecture => (
                    <div key={lecture.id} className="lecture-item">
                      <div className="lecture-info">
                        <h4>{lecture.title}</h4>
                        <p>Duration: {lecture.duration}</p>
                      </div>
                      <button className="action-btn view">Play</button>
                    </div>
                  ))}
                  
                  <div className="add-item">
                    <h4>Add New Lecture</h4>
                    <input
                      type="text"
                      placeholder="Lecture title"
                      value={newLecture.title}
                      onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value, courseId: selectedCourse.id })}
                    />
                    <input
                      type="text"
                      placeholder="Video URL"
                      value={newLecture.videoUrl}
                      onChange={(e) => setNewLecture({ ...newLecture, videoUrl: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g., 15:30)"
                      value={newLecture.duration}
                      onChange={(e) => setNewLecture({ ...newLecture, duration: e.target.value })}
                    />
                    <button 
                      className="add-btn"
                      onClick={() => handleAddLecture(selectedCourse.id)}
                    >
                      Add Lecture
                    </button>
                  </div>
                </div>
              </div>

              <div className="course-section">
                <h3>Quizzes</h3>
                <div className="section-content">
                  {selectedCourse.quizzes.map(quiz => (
                    <div key={quiz.id} className="quiz-item">
                      <div className="quiz-info">
                        <h4>{quiz.title}</h4>
                        <p>{quiz.questions} questions • {quiz.attempts} attempts</p>
                      </div>
                      <button className="action-btn edit">Edit</button>
                    </div>
                  ))}

                  <div className="add-item">
                    <h4>Create New Quiz</h4>
                    <input
                      type="text"
                      placeholder="Quiz title"
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value, courseId: selectedCourse.id })}
                    />
                    <textarea
                      placeholder="Quiz description"
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                    />
                    <button 
                      className="add-btn"
                      onClick={() => handleAddQuiz(selectedCourse.id)}
                    >
                      Create Quiz
                    </button>
                  </div>
                </div>
              </div>

              <div className="course-section">
                <h3>Assignments</h3>
                <div className="section-content">
                  {selectedCourse.assignments.map(assignment => (
                    <div key={assignment.id} className="assignment-item">
                      <div className="assignment-info">
                        <h4>{assignment.title}</h4>
                        <p>Due: {assignment.dueDate} • {assignment.submissions} submissions</p>
                      </div>
                      <button className="action-btn view">Grade</button>
                    </div>
                  ))}

                  <div className="add-item">
                    <h4>Create New Assignment</h4>
                    <input
                      type="text"
                      placeholder="Assignment title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value, courseId: selectedCourse.id })}
                    />
                    <textarea
                      placeholder="Assignment description"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    />
                    <input
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    />
                    <button 
                      className="add-btn"
                      onClick={() => handleAddAssignment(selectedCourse.id)}
                    >
                      Create Assignment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="tab-content">
            <h2>Live Sessions</h2>
            
            <div className="schedule-session">
              <h3>Schedule New Session</h3>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Session title"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                />
                <select
                  value={newSession.course}
                  onChange={(e) => setNewSession({ ...newSession, course: e.target.value })}
                >
                  <option value="">Select course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.title}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                />
                <input
                  type="time"
                  value={newSession.time}
                  onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 60 min)"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Meeting link"
                  value={newSession.meetingLink}
                  onChange={(e) => setNewSession({ ...newSession, meetingLink: e.target.value })}
                />
                <button className="submit-btn" onClick={handleScheduleSession}>
                  Schedule Session
                </button>
              </div>
            </div>

            <div className="sessions-list">
              <h3>Upcoming Sessions</h3>
              {sessions.map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-info">
                    <h4>{session.title}</h4>
                    <p>Course: {session.course}</p>
                    <p>Date: {session.date} at {session.time}</p>
                    <p>Duration: {session.duration}</p>
                    <p>Attendees: {session.attendees}</p>
                  </div>
                  <div className="session-actions">
                    <a 
                      href={session.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="join-btn"
                    >
                      Join Session
                    </a>
                    <button className="action-btn edit">Edit</button>
                    <button className="action-btn cancel">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content">
            <h2>Course Analytics</h2>
            
            <div className="analytics-cards">
              <div className="analytics-card">
                <h3>Total Students</h3>
                <p className="analytics-number">
                  {courses.reduce((sum, course) => sum + course.students, 0)}
                </p>
              </div>
              <div className="analytics-card">
                <h3>Total Courses</h3>
                <p className="analytics-number">{courses.length}</p>
              </div>
              <div className="analytics-card">
                <h3>Published Courses</h3>
                <p className="analytics-number">
                  {courses.filter(c => c.status === 'published').length}
                </p>
              </div>
              <div className="analytics-card">
                <h3>Completion Rate</h3>
                <p className="analytics-number">78%</p>
              </div>
            </div>

            <div className="course-performance">
              <h3>Course Performance</h3>
              {courses.map(course => (
                <div key={course.id} className="performance-item">
                  <div className="performance-info">
                    <h4>{course.title}</h4>
                    <p>Students: {course.students} • Lectures: {course.lectures.length} • Quizzes: {course.quizzes.length}</p>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(100, (course.students / 50) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="tab-content">
            <h2>My Students</h2>
            
            <div className="students-list">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Progress</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Alice Johnson</td>
                    <td>Introduction to React</td>
                    <td>
                      <div className="progress-bar small">
                        <div className="progress-fill" style={{ width: '75%' }}></div>
                      </div>
                    </td>
                    <td>2 hours ago</td>
                    <td>
                      <button className="action-btn view">Message</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Bob Smith</td>
                    <td>Advanced JavaScript</td>
                    <td>
                      <div className="progress-bar small">
                        <div className="progress-fill" style={{ width: '45%' }}></div>
                      </div>
                    </td>
                    <td>1 day ago</td>
                    <td>
                      <button className="action-btn view">Message</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Carol White</td>
                    <td>Introduction to React</td>
                    <td>
                      <div className="progress-bar small">
                        <div className="progress-fill" style={{ width: '90%' }}></div>
                      </div>
                    </td>
                    <td>5 hours ago</td>
                    <td>
                      <button className="action-btn view">Message</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;