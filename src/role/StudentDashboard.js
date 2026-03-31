import React, { useState, useEffect } from 'react'
import { courseService } from '../services/courses'
import { enrollmentService } from '../services/enrollment'
import { lectureService } from '../services/lecture'
import { quizService } from '../services/quiz'
import QuizList from './QuizList'
import QuizPlayer from './QuizPlayer'
import QuizResults from './QuizResults'
import QuizHistory from './QuizHistory'
import './StudentDashboard.css'

const StudentDashboard = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedLecture, setSelectedLecture] = useState(null)
  const [courseProgress, setCourseProgress] = useState({})
  const [quizView, setQuizView] = useState('list') // list, player, results, history
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [quizResult, setQuizResult] = useState(null)

  // Load dashboard data on component mount
 useEffect(() => {
  loadDashboardData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  const loadDashboardData = async () => {
    setLoading(true)
    
    // Load enrolled courses with progress
    const { data: enrolled, error: enrolledError } = await enrollmentService.getStudentCourses(user.profile.id)
    if (!enrolledError && enrolled) {
      setEnrolledCourses(enrolled)
      
      // Calculate progress for each course
      const progressData = {}
      for (const enrollment of enrolled) {
        const { progress } = await lectureService.calculateCourseProgress(
          user.profile.id, 
          enrollment.course.id
        )
        progressData[enrollment.course.id] = progress
      }
      setCourseProgress(progressData)
    }

    // Load available courses
    const { data: available, error: availableError } = await courseService.getPublishedCourses()
    if (!availableError && available) {
      setAvailableCourses(available)
    }

    setLoading(false)
  }

  const handleEnroll = async (courseId) => {
  const { error } = await enrollmentService.enrollStudent(user.profile.id, courseId)
  if (!error) {
    await loadDashboardData()
    alert('Successfully enrolled in the course!')
  } else {
    alert('Failed to enroll: ' + error.message)
  }
}
  const handleViewCourse = async (course) => {
    setSelectedCourse(course)
    setActiveTab('course-view')
    
    // Load full course details including lectures
    const { data: fullCourse, error } = await courseService.getCourseById(course.id)
    if (!error && fullCourse) {
      setSelectedCourse(fullCourse)
    }
  }

  const handleLectureComplete = async (lectureId) => {
    const { error } = await lectureService.trackProgress(
      user.profile.id,
      lectureId,
      true
    )
    
    if (!error) {
      // Update progress for the course
      const { progress } = await lectureService.calculateCourseProgress(
        user.profile.id,
        selectedCourse.id
      )
      
      setCourseProgress({
        ...courseProgress,
        [selectedCourse.id]: progress
      })
      
      // Update local lecture status
      const updatedLectures = selectedCourse.lectures.map(lecture =>
        lecture.id === lectureId ? { ...lecture, completed: true } : lecture
      )
      setSelectedCourse({
        ...selectedCourse,
        lectures: updatedLectures
      })
      
      alert('Lecture marked as completed!')
    }
  }

  // Quiz handlers
  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setQuizView('player')
  }

  const handleQuizComplete = (result) => {
    setQuizResult(result)
    setQuizView('results')
  }

  const handleRetakeQuiz = () => {
    setQuizView('player')
    setQuizResult(null)
  }

  const handleBackToQuizzes = () => {
    setQuizView('list')
    setSelectedQuiz(null)
    setQuizResult(null)
  }

  const handleBackFromQuizzes = () => {
    setActiveTab('course-view')
    setQuizView('list')
    setSelectedQuiz(null)
    setQuizResult(null)
  }

  // Dashboard view
  const renderDashboard = () => (
    <div>
      <h2>My Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>Enrolled Courses</h3>
            <p className="stat-number">{enrolledCourses.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Completed</h3>
            <p className="stat-number">
              {enrolledCourses.filter(c => courseProgress[c.course?.id] === 100).length}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <h3>Available Courses</h3>
            <p className="stat-number">{availableCourses.length}</p>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      {enrolledCourses.length > 0 && (
        <div className="continue-learning">
          <h3>Continue Learning</h3>
          <div className="courses-grid">
            {enrolledCourses.slice(0, 2).map(enrollment => (
              <div key={enrollment.course.id} className="course-card">
                <img 
                  src={enrollment.course.thumbnail_url || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(enrollment.course.title.split(' ')[0])} 
                  alt={enrollment.course.title} 
                />
                <div className="course-info">
                  <h4>{enrollment.course.title}</h4>
                  <p>{enrollment.course.instructor?.full_name || 'Instructor'}</p>
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${courseProgress[enrollment.course.id] || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{courseProgress[enrollment.course.id] || 0}%</span>
                  </div>
                  <button 
                    className="continue-btn"
                    onClick={() => handleViewCourse(enrollment.course)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Deadlines - You can add this feature later */}
    </div>
  )

  // My Courses view
  const renderMyCourses = () => (
    <div>
      <h2>My Courses</h2>
      {enrolledCourses.length === 0 ? (
        <p>You haven't enrolled in any courses yet. Browse available courses to get started!</p>
      ) : (
        <div className="courses-grid">
          {enrolledCourses.map(enrollment => (
            <div key={enrollment.course.id} className="course-card enrolled">
              <img 
                src={enrollment.course.thumbnail_url || 'https://via.placeholder.com/300x200'} 
                alt={enrollment.course.title} 
              />
              <div className="course-info">
                <h4>{enrollment.course.title}</h4>
                <p className="instructor">{enrollment.course.instructor?.full_name || 'Instructor'}</p>
                <p className="description">{enrollment.course.description}</p>
                <div className="course-meta">
                  <span>📚 {enrollment.course.lectures?.length || 0} lectures</span>
                  <span>⏱️ {enrollment.course.duration}</span>
                </div>
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${courseProgress[enrollment.course.id] || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{courseProgress[enrollment.course.id] || 0}% complete</span>
                </div>
                <button 
                  className="continue-btn"
                  onClick={() => handleViewCourse(enrollment.course)}
                >
                  {courseProgress[enrollment.course.id] === 100 ? 'Review Course' : 'Continue Learning'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Discover Courses view
  const renderDiscoverCourses = () => (
    <div>
      <h2>Discover Courses</h2>
      
      <div className="filters">
        <input 
          type="text" 
          placeholder="Search courses..." 
          className="search-input"
        />
      </div>

      <div className="courses-grid">
        {availableCourses.map(course => (
          <div key={course.id} className="course-card">
            <img 
              src={course.thumbnail_url || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(course.title.split(' ')[0])} 
              alt={course.title} 
            />
            <div className="course-info">
              <h4>{course.title}</h4>
              <p className="instructor">{course.instructor?.full_name || 'Instructor'}</p>
              <p className="description">{course.description}</p>
              <div className="course-meta">
                <span>📚 {course.lectures?.length || 0} lectures</span>
                <span>⏱️ {course.duration}</span>
                <span>👥 {course.enrollments?.[0]?.count || 0} students</span>
              </div>
              <div className="tags">
                <span className="tag">{course.level}</span>
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
  )

  // Course View (with lectures)
  const renderCourseView = () => (
    <div className="course-view">
      <div className="course-header">
        <button className="back-btn" onClick={() => setActiveTab('my-courses')}>
          ← Back to Courses
        </button>
        <h2>{selectedCourse?.title}</h2>
      </div>

      <div className="course-content">
        <div className="video-section">
          {selectedLecture ? (
            <div className="video-player">
              <div className="video-placeholder">
                <div className="video-controls">
                  <button className="play-btn">▶️</button>
                  <div className="progress-bar video-progress">
                    <div className="progress-fill" style={{ width: '0%' }}></div>
                  </div>
                  <span className="time">0:00 / {selectedLecture.duration}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-video">
              <p>Select a lecture to start watching</p>
            </div>
          )}

          <div className="course-progress">
            <h3>Your Progress</h3>
            <div className="progress-bar large">
              <div 
                className="progress-fill" 
                style={{ width: `${courseProgress[selectedCourse?.id] || 0}%` }}
              ></div>
            </div>
            <p>{courseProgress[selectedCourse?.id] || 0}% Complete</p>
          </div>
        </div>

        <div className="course-sidebar">
          <h3>Course Content</h3>
          
          {/* Lectures */}
          <div className="content-section">
            <h4>📹 Lectures</h4>
            {selectedCourse?.lectures?.map(lecture => (
              <div 
                key={lecture.id} 
                className={`content-item ${lecture.completed ? 'completed' : ''} ${selectedLecture?.id === lecture.id ? 'active' : ''}`}
                onClick={() => setSelectedLecture(lecture)}
              >
                <span className="item-icon">{lecture.completed ? '✅' : '📹'}</span>
                <span className="item-title">{lecture.title}</span>
                <span className="item-duration">{lecture.duration}</span>
                {!lecture.completed && (
                  <button 
                    className="complete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLectureComplete(lecture.id)
                    }}
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quizzes */}
          <div className="content-section">
            <h4>📝 Quizzes</h4>
            <button 
              className="quiz-section-btn"
              onClick={() => setActiveTab('course-view')}
            >
              📋 View Course Quizzes
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="student-dashboard">
      {/* Sidebar */}
      <div className="student-sidebar">
        <div className="sidebar-header">
          <h2>Student Portal</h2>
          <p>Welcome, {user.profile.full_name || 'Student'}</p>
        </div>
        
        <div className="student-profile-mini">
          <div className="avatar">👨‍🎓</div>
          <div className="student-info">
            <p className="student-name">{user.profile.full_name || 'Student'}</p>
            <p className="student-email">{user.email}</p>
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
            className={`nav-btn ${activeTab === 'quiz-history' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz-history')}
          >
            📝 Quiz History
          </button>
        </nav>
        
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="student-main">
        <div className="tab-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'my-courses' && renderMyCourses()}
          {activeTab === 'discover' && renderDiscoverCourses()}
          {activeTab === 'course-view' && (
            selectedCourse ? (
              quizView !== 'list' ? (
                <div>
                  {quizView === 'player' && selectedQuiz && (
                    <QuizPlayer 
                      quiz={selectedQuiz} 
                      userId={user.profile.id}
                      courseId={selectedCourse.id}
                      onComplete={handleQuizComplete}
                      onBack={handleBackToQuizzes}
                    />
                  )}
                  {quizView === 'results' && quizResult && (
                    <QuizResults 
                      quizResult={quizResult}
                      quiz={selectedQuiz}
                      onBack={handleBackFromQuizzes}
                      onRetake={handleRetakeQuiz}
                    />
                  )}
                </div>
              ) : (
                <QuizList 
                  courseId={selectedCourse.id}
                  userId={user.profile.id}
                  onSelectQuiz={handleSelectQuiz}
                  onBack={() => setActiveTab('my-courses')}
                />
              )
            ) : renderCourseView()
          )}
          {activeTab === 'quiz-history' && (
            <QuizHistory 
              courseId={selectedCourse?.id || null}
              userId={user.profile.id}
              onBack={() => setActiveTab('dashboard')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard