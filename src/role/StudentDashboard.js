import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  
  const [student, setStudent] = useState({
    name: 'John Doe',
    email: 'student@college.edu',
    enrolledCourses: [1, 2],
    totalCourses: 4,
    completedCourses: 1,
    totalHours: 28,
    achievements: 3
  });

  const [availableCourses, setAvailableCourses] = useState([
    {
      id: 1,
      title: 'Introduction to React',
      description: 'Learn the basics of React including components, hooks, and state management.',
      instructor: 'Dr. Sarah Wilson',
      category: 'Computer Science',
      level: 'Beginner',
      duration: '8 weeks',
      enrolled: 45,
      rating: 4.8,
      thumbnail: 'https://via.placeholder.com/300x200',
      progress: 75,
      lectures: [
        { id: 1, title: 'Getting Started with React', duration: '15:30', videoUrl: '#', completed: true },
        { id: 2, title: 'Components and Props', duration: '20:45', videoUrl: '#', completed: true },
        { id: 3, title: 'State and Lifecycle', duration: '18:20', videoUrl: '#', completed: false },
        { id: 4, title: 'Hooks Overview', duration: '22:10', videoUrl: '#', completed: false }
      ],
      quizzes: [
        { id: 1, title: 'React Basics Quiz', questions: 10, completed: true, score: 85 },
        { id: 2, title: 'Components Quiz', questions: 8, completed: false, score: null }
      ],
      assignments: [
        { id: 1, title: 'Build a Todo App', dueDate: '2024-04-15', status: 'pending', grade: null },
        { id: 2, title: 'Create a Counter Component', dueDate: '2024-04-10', status: 'submitted', grade: 92 }
      ]
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      description: 'Master advanced JavaScript concepts including closures, promises, and async/await.',
      instructor: 'Prof. Michael Brown',
      category: 'Programming',
      level: 'Advanced',
      duration: '10 weeks',
      enrolled: 32,
      rating: 4.6,
      thumbnail: 'https://via.placeholder.com/300x200',
      progress: 45,
      lectures: [
        { id: 1, title: 'Closures and Scope', duration: '25:30', videoUrl: '#', completed: true },
        { id: 2, title: 'Promises and Async/Await', duration: '30:15', videoUrl: '#', completed: true },
        { id: 3, title: 'Event Loop', duration: '20:45', videoUrl: '#', completed: false }
      ],
      quizzes: [
        { id: 1, title: 'JavaScript Advanced Quiz', questions: 15, completed: true, score: 78 }
      ],
      assignments: [
        { id: 1, title: 'Implement Promise Methods', dueDate: '2024-04-20', status: 'pending', grade: null }
      ]
    },
    {
      id: 3,
      title: 'Data Structures & Algorithms',
      description: 'Learn fundamental data structures and algorithms for efficient problem solving.',
      instructor: 'Dr. Emily Davis',
      category: 'Computer Science',
      level: 'Intermediate',
      duration: '12 weeks',
      enrolled: 28,
      rating: 4.9,
      thumbnail: 'https://via.placeholder.com/300x200',
      progress: 0,
      lectures: [
        { id: 1, title: 'Arrays and Strings', duration: '28:30', videoUrl: '#', completed: false },
        { id: 2, title: 'Linked Lists', duration: '32:15', videoUrl: '#', completed: false }
      ],
      quizzes: [],
      assignments: []
    },
    {
      id: 4,
      title: 'Python for Beginners',
      description: 'Start your programming journey with Python, from basics to real-world applications.',
      instructor: 'Prof. David Lee',
      category: 'Programming',
      level: 'Beginner',
      duration: '6 weeks',
      enrolled: 56,
      rating: 4.7,
      thumbnail: 'https://via.placeholder.com/300x200',
      progress: 0,
      lectures: [
        { id: 1, title: 'Python Basics', duration: '20:30', videoUrl: '#', completed: false }
      ],
      quizzes: [],
      assignments: []
    }
  ]);

  const enrolledCourses = availableCourses.filter(course => 
    student.enrolledCourses.includes(course.id)
  );

  const recommendedCourses = availableCourses.filter(course => 
    !student.enrolledCourses.includes(course.id)
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);

  const handleEnroll = (courseId) => {
    setStudent(prev => ({
      ...prev,
      enrolledCourses: [...prev.enrolledCourses, courseId]
    }));
  };

  const handleLectureComplete = (courseId, lectureId) => {
    setAvailableCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedLectures = course.lectures.map(lecture =>
          lecture.id === lectureId ? { ...lecture, completed: true } : lecture
        );
        
        const completedCount = updatedLectures.filter(l => l.completed).length;
        const progress = Math.round((completedCount / updatedLectures.length) * 100);
        
        return { ...course, lectures: updatedLectures, progress };
      }
      return course;
    }));
  };
  const handleQuizSubmit = (courseId, quizId) => {
    const score = 70; 
    
    setAvailableCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedQuizzes = course.quizzes.map(quiz =>
          quiz.id === quizId ? { ...quiz, completed: true, score } : quiz
        );
        return { ...course, quizzes: updatedQuizzes };
      }
      return course;
    }));

    setQuizResults({ score, passed: score >= 70 });
    setActiveQuiz(null);
  };

  const handleAssignmentSubmit = (courseId, assignmentId) => {
    setAvailableCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedAssignments = course.assignments.map(assignment =>
          assignment.id === assignmentId ? { ...assignment, status: 'submitted' } : assignment
        );
        return { ...course, assignments: updatedAssignments };
      }
      return course;
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  return (
    <div className="student-dashboard">
      <div className="student-sidebar">
        <div className="sidebar-header">
          <h2>Student Portal</h2>
          <p>Welcome, {student.name}</p>
        </div>
        
        <div className="student-profile-mini">
          <div className="avatar">👨‍🎓</div>
          <div className="student-info">
            <p className="student-name">{student.name}</p>
            <p className="student-email">{student.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'my-courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-courses')}
          >
            📚 My Courses
          </button>
          <button 
            className={`nav-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            🔍 Discover Courses
          </button>
          <button 
            className={`nav-btn ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            📈 My Progress
          </button>
          <button 
            className={`nav-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            📝 Assignments
          </button>
          <button 
            className={`nav-btn ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            🏆 Certificates
          </button>
        </nav>
        
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="student-main">
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>Dashboard</h2>
            
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                  <h3>Enrolled Courses</h3>
                  <p className="stat-number">{student.enrolledCourses.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>Completed</h3>
                  <p className="stat-number">{student.completedCourses}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-info">
                  <h3>Hours Learned</h3>
                  <p className="stat-number">{student.totalHours}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏅</div>
                <div className="stat-info">
                  <h3>Achievements</h3>
                  <p className="stat-number">{student.achievements}</p>
                </div>
              </div>
            </div>

            <div className="continue-learning">
              <h3>Continue Learning</h3>
              <div className="courses-grid">
                {enrolledCourses.filter(c => c.progress < 100).slice(0, 2).map(course => (
                  <div key={course.id} className="course-card">
                    <img src={course.thumbnail} alt={course.title} />
                    <div className="course-info">
                      <h4>{course.title}</h4>
                      <p>{course.instructor}</p>
                      <div className="progress-section">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <span className="progress-text">{course.progress}%</span>
                      </div>
                      <button 
                        className="continue-btn"
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveTab('course-view');
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="deadlines">
              <h3>Upcoming Deadlines</h3>
              <div className="deadlines-list">
                {enrolledCourses.flatMap(course => 
                  course.assignments
                    .filter(a => a.status === 'pending')
                    .map(assignment => ({
                      ...assignment,
                      courseTitle: course.title
                    }))
                ).map((assignment, index) => (
                  <div key={index} className="deadline-item">
                    <div className="deadline-info">
                      <h4>{assignment.title}</h4>
                      <p>{assignment.courseTitle} • Due: {assignment.dueDate}</p>
                    </div>
                    <button className="submit-btn-small">Submit</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-courses' && (
          <div className="tab-content">
            <h2>My Courses</h2>
            <div className="courses-grid">
              {enrolledCourses.map(course => (
                <div key={course.id} className="course-card enrolled">
                  <img src={course.thumbnail} alt={course.title} />
                  <div className="course-info">
                    <h4>{course.title}</h4>
                    <p className="instructor">{course.instructor}</p>
                    <p className="description">{course.description}</p>
                    <div className="course-meta">
                      <span>📚 {course.lectures.length} lectures</span>
                      <span>⏱️ {course.duration}</span>
                      <span>⭐ {course.rating}</span>
                    </div>
                    <div className="progress-section">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <span className="progress-text">{course.progress}% complete</span>
                    </div>
                    <button 
                      className="continue-btn"
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveTab('course-view');
                      }}
                    >
                      {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="tab-content">
            <h2>Discover Courses</h2>
            
            <div className="filters">
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="search-input"
              />
              <select className="filter-select">
                <option>All Categories</option>
                <option>Computer Science</option>
                <option>Programming</option>
                <option>Mathematics</option>
              </select>
              <select className="filter-select">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <h3>Recommended for You</h3>
            <div className="courses-grid">
              {recommendedCourses.map(course => (
                <div key={course.id} className="course-card">
                  <img src={course.thumbnail} alt={course.title} />
                  <div className="course-info">
                    <h4>{course.title}</h4>
                    <p className="instructor">{course.instructor}</p>
                    <p className="description">{course.description}</p>
                    <div className="course-meta">
                      <span>📚 {course.lectures.length} lectures</span>
                      <span>⏱️ {course.duration}</span>
                      <span>⭐ {course.rating}</span>
                      <span>👥 {course.enrolled} students</span>
                    </div>
                    <div className="tags">
                      <span className="tag">{course.level}</span>
                      <span className="tag">{course.category}</span>
                    </div>
                    <button 
                      className="enroll-btn"
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'course-view' && selectedCourse && (
          <div className="tab-content course-view">
            <div className="course-header">
              <button className="back-btn" onClick={() => setActiveTab('my-courses')}>
                ← Back to Courses
              </button>
              <h2>{selectedCourse.title}</h2>
            </div>

            <div className="course-content">
              <div className="video-section">
                {selectedLecture ? (
                  <div className="video-player">
                    <div className="video-placeholder">
                      <div className="video-controls">
                        <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>
                          {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <div className="progress-bar video-progress">
                          <div className="progress-fill" style={{ width: '35%' }}></div>
                        </div>
                        <span className="time">15:30 / {selectedLecture.duration}</span>
                        <select 
                          className="speed-select"
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        >
                          <option value="0.5">0.5x</option>
                          <option value="1">1x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2x</option>
                        </select>
                        <button className="notes-btn" onClick={() => setShowNotes(!showNotes)}>
                          📝 Notes
                        </button>
                      </div>
                    </div>
                    
                    {showNotes && (
                      <div className="notes-section">
                        <h4>Your Notes</h4>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Take notes while watching..."
                          rows="4"
                        />
                        <button className="save-notes">Save Notes</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-video">
                    <p>Select a lecture to start watching</p>
                  </div>
                )}

                <div className="course-progress">
                  <h3>Your Progress</h3>
                  <div className="progress-bar large">
                    <div className="progress-fill" style={{ width: `${selectedCourse.progress}%` }}></div>
                  </div>
                  <p>{selectedCourse.progress}% Complete</p>
                </div>
              </div>

              <div className="course-sidebar">
                <h3>Course Content</h3>
                
                <div className="content-section">
                  <h4>📹 Lectures</h4>
                  {selectedCourse.lectures.map(lecture => (
                    <div 
                      key={lecture.id} 
                      className={`content-item ${lecture.completed ? 'completed' : ''} ${selectedLecture?.id === lecture.id ? 'active' : ''}`}
                      onClick={() => setSelectedLecture(lecture)}
                    >
                      <span className="item-icon">{lecture.completed ? '✅' : '📹'}</span>
                      <span className="item-title">{lecture.title}</span>
                      <span className="item-duration">{lecture.duration}</span>
                      {lecture.completed && <span className="completed-badge">Completed</span>}
                    </div>
                  ))}
                </div>

                <div className="content-section">
                  <h4>📝 Quizzes</h4>
                  {selectedCourse.quizzes.map(quiz => (
                    <div key={quiz.id} className="content-item">
                      <span className="item-icon">📝</span>
                      <span className="item-title">{quiz.title}</span>
                      {quiz.completed ? (
                        <span className="quiz-score">Score: {quiz.score}%</span>
                      ) : (
                        <button 
                          className="take-quiz-btn"
                          onClick={() => setActiveQuiz(quiz)}
                        >
                          Take Quiz
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="content-section">
                  <h4>📋 Assignments</h4>
                  {selectedCourse.assignments.map(assignment => (
                    <div key={assignment.id} className="content-item">
                      <span className="item-icon">📋</span>
                      <span className="item-title">{assignment.title}</span>
                      <span className="due-date">Due: {assignment.dueDate}</span>
                      {assignment.status === 'submitted' ? (
                        <span className="grade">Grade: {assignment.grade}</span>
                      ) : (
                        <button 
                          className="submit-btn-small"
                          onClick={() => handleAssignmentSubmit(selectedCourse.id, assignment.id)}
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeQuiz && (
          <div className="quiz-modal">
            <div className="quiz-content">
              <h3>{activeQuiz.title}</h3>
              <p>Answer the following questions:</p>
              
              {quizResults ? (
                <div className="quiz-results">
                  <h4>Your Score: {quizResults.score}%</h4>
                  <p className={quizResults.passed ? 'passed' : 'failed'}>
                    {quizResults.passed ? '✅ You passed!' : '❌ You need to score at least 70%'}
                  </p>
                  <button 
                    className="close-quiz-btn"
                    onClick={() => {
                      setActiveQuiz(null);
                      setQuizResults(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="quiz-questions">
                  {[1, 2, 3].map(q => (
                    <div key={q} className="quiz-question">
                      <p>Question {q}: What is React?</p>
                      <div className="options">
                        <label>
                          <input type="radio" name={`q${q}`} /> A library for building UIs
                        </label>
                        <label>
                          <input type="radio" name={`q${q}`} /> A programming language
                        </label>
                        <label>
                          <input type="radio" name={`q${q}`} /> A database
                        </label>
                      </div>
                    </div>
                  ))}
                  <button 
                    className="submit-quiz-btn"
                    onClick={() => handleQuizSubmit(selectedCourse.id, activeQuiz.id)}
                  >
                    Submit Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="tab-content">
            <h2>My Learning Progress</h2>
            
            <div className="progress-overview">
              <div className="progress-chart">
                <h3>Overall Progress</h3>
                <div className="circular-progress">
                  <div className="progress-value">
                    {Math.round((student.completedCourses / student.enrolledCourses.length) * 100)}%
                  </div>
                </div>
              </div>

              <div className="course-progress-list">
                <h3>Course-wise Progress</h3>
                {enrolledCourses.map(course => (
                  <div key={course.id} className="course-progress-item">
                    <div className="course-progress-info">
                      <h4>{course.title}</h4>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <div className="course-stats">
                      <span>✅ {course.lectures.filter(l => l.completed).length}/{course.lectures.length} lectures</span>
                      <span>📝 {course.quizzes.filter(q => q.completed).length}/{course.quizzes.length} quizzes</span>
                      <span>📋 {course.assignments.filter(a => a.status === 'submitted').length}/{course.assignments.length} assignments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="tab-content">
            <h2>My Assignments</h2>
            
            <div className="assignments-list">
              <h3>Pending Assignments</h3>
              {enrolledCourses.flatMap(course => 
                course.assignments
                  .filter(a => a.status === 'pending')
                  .map(assignment => ({
                    ...assignment,
                    courseTitle: course.title,
                    courseId: course.id
                  }))
              ).map((assignment, index) => (
                <div key={index} className="assignment-card pending">
                  <div className="assignment-info">
                    <h4>{assignment.title}</h4>
                    <p className="course-name">{assignment.courseTitle}</p>
                    <p className="due-date">Due: {assignment.dueDate}</p>
                  </div>
                  <button 
                    className="submit-btn"
                    onClick={() => handleAssignmentSubmit(assignment.courseId, assignment.id)}
                  >
                    Submit Assignment
                  </button>
                </div>
              ))}

              <h3>Submitted Assignments</h3>
              {enrolledCourses.flatMap(course => 
                course.assignments
                  .filter(a => a.status === 'submitted')
                  .map(assignment => ({
                    ...assignment,
                    courseTitle: course.title
                  }))
              ).map((assignment, index) => (
                <div key={index} className="assignment-card submitted">
                  <div className="assignment-info">
                    <h4>{assignment.title}</h4>
                    <p className="course-name">{assignment.courseTitle}</p>
                    <p className="grade">Grade: {assignment.grade || 'Pending'}</p>
                  </div>
                  <span className="status-badge">Submitted</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="tab-content">
            <h2>My Certificates</h2>
            
            <div className="certificates-grid">
              {enrolledCourses.filter(c => c.progress === 100).map(course => (
                <div key={course.id} className="certificate-card">
                  <div className="certificate-icon">🏆</div>
                  <div className="certificate-info">
                    <h3>{course.title}</h3>
                    <p>Issued by {course.instructor}</p>
                    <p>Completed on: {new Date().toLocaleDateString()}</p>
                  </div>
                  <button className="download-cert-btn">Download PDF</button>
                </div>
              ))}
              
              {enrolledCourses.filter(c => c.progress === 100).length === 0 && (
                <p className="no-certificates">Complete a course to earn your first certificate!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;