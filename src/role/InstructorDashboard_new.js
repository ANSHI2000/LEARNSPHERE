import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiClient from '../api/apiClient';
import Messaging from './Messaging';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    level: 'beginner',
    weeks: 4,
    isPaid: false,
  });

  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    theory: '',
    resources: [],
    duration: 0,
    week: 1,
  });

  const [quizForm, setQuizForm] = useState({
    title: '',
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.courseAPI.getInstructorCourses();
      setCourses(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        ...courseForm,
        price: courseForm.isPaid ? parseFloat(courseForm.price) : 0,
      };

      await apiClient.courseAPI.create(courseData);
      alert('✅ Course created successfully!');
      setCourseForm({
        title: '',
        description: '',
        category: '',
        price: 0,
        level: 'beginner',
        weeks: 4,
        isPaid: false,
      });
      setShowCreateModal(false);
      fetchInstructorCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
      console.error(err);
    }
  };

  const normalizeVideoUrl = (value) => {
    const raw = (value || '').trim();
    if (!raw) return '';

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }

    // Handle pasted query-like values such as "?v=VIDEO_ID"
    if (raw.startsWith('?v=')) {
      return `https://www.youtube.com/watch${raw}`;
    }

    // Handle plain YouTube video id
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
      return `https://www.youtube.com/watch?v=${raw}`;
    }

    // Handle values like "youtube.com/watch?v=..." or "youtu.be/..."
    return `https://${raw.replace(/^\/+/, '')}`;
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const normalizedVideoUrl = normalizeVideoUrl(lectureForm.videoUrl);

      const lectureData = {
        ...lectureForm,
        videoUrl: normalizedVideoUrl,
        courseId: selectedCourse.id,
      };

      await apiClient.lectureAPI.create(lectureData);
      alert('✅ Lecture added successfully!');

      setLectureForm({
        title: '',
        description: '',
        videoUrl: '',
        theory: '',
        resources: [],
        duration: 0,
        week: 1,
      });
      setShowLectureModal(false);
      fetchInstructorCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add lecture');
      console.error(err);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedQuiz(null);
    setShowLectureModal(false);
    setShowQuizModal(false);
  };

  const handleDeleteCourse = async (courseId) => {
    const confirmed = window.confirm('Are you sure you want to delete this course? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await apiClient.courseAPI.delete(courseId);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));

      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }

      alert('✅ Course deleted successfully.');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete course');
      console.error(err);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      if (!quizForm.title) {
        setError('Quiz title required');
        return;
      }

      const result = await apiClient.quizAPI.create({
        title: quizForm.title,
        courseId: selectedCourse.id,
      });

      setSelectedQuiz(result.data?.quiz);
      setQuizForm({ title: '' });
      setShowQuizModal(false);
      alert('✅ Quiz created! Now add questions.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create quiz');
      console.error(err);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    try {
      if (!questionForm.question || questionForm.options.some(opt => !opt)) {
        setError('Question and all options must be filled');
        return;
      }

      await apiClient.quizAPI.addQuestion(selectedQuiz.id, {
        question: questionForm.question,
        options: questionForm.options,
        correctAnswer: questionForm.correctAnswer,
      });

      alert('✅ Question added! You can add another question now.');
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
      });
      fetchInstructorCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add question');
      console.error(err);
    }
  };

  return (
    <div className="instructor-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <p>Welcome, {user?.name}! 👨‍🏫</p>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          My Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Income & Stats
        </button>
        <button
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          📧 Messages
        </button>
      </div>

      {/* Statistics Section */}
      <div className="statistics-section">
        <div className="stat-card stat-courses">
          <h3>📚 Total Courses</h3>
          <p className="stat-number">{courses.length}</p>
          <p className="stat-label">Courses created</p>
        </div>
        <div className="stat-card stat-students">
          <h3>👥 Total Students</h3>
          <p className="stat-number">
            {courses.reduce((sum, course) => sum + (course.enrollments?.length || 0), 0)}
          </p>
          <p className="stat-label">Enrolled students</p>
        </div>
        <div className="stat-card stat-lectures">
          <h3>🎤 Total Lectures</h3>
          <p className="stat-number">
            {courses.reduce((sum, course) => sum + (course.lectures?.length || 0), 0)}
          </p>
          <p className="stat-label">Lectures uploaded</p>
        </div>
        <div className="stat-card stat-income">
          <h3>💰 Total Income</h3>
          <p className="stat-number">
            ₹{courses.reduce((sum, course) => 
              sum + (course.enrollments?.length || 0) * course.price, 0
            ).toLocaleString()}
          </p>
          <p className="stat-label">From paid courses</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <p className="loading">Loading courses...</p>}

      {/* My Courses Tab */}
      {activeTab === 'courses' && !loading && (
        <div className="courses-section">
          <div className="section-header">
            <h2>My Courses</h2>
            <button className="btn-primary-add" onClick={() => setShowCreateModal(true)}>
              ➕ Create New Course
            </button>
          </div>

          <div className="courses-grid">
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-type-badge">
                    {course.price > 0 ? `💰 ₹${course.price}` : '🆓 FREE'}
                  </div>
                  <h3>{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  
                  <div className="course-meta">
                    <span>📂 {course.category}</span>
                    <span>📊 Level: {course.level}</span>
                    <span>📅 {course.weeks} weeks</span>
                  </div>

                  <div className="course-stats">
                    <div className="stat">
                      <span className="stat-value">{course.lectures?.length || 0}</span>
                      <span className="stat-name">Lectures</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{course.enrollments?.length || 0}</span>
                      <span className="stat-name">Students</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">₹{(course.price * (course.enrollments?.length || 0)).toLocaleString()}</span>
                      <span className="stat-name">Revenue</span>
                    </div>
                  </div>

                  <div className="course-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleCourseSelect(course)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn-lecture"
                      onClick={() => {
                        handleCourseSelect(course);
                        setShowLectureModal(true);
                      }}
                    >
                      Add Lecture
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses-message">
                <p>📚 No courses created yet.</p>
                <button className="btn-primary-add" onClick={() => setShowCreateModal(true)}>
                  Create Your First Course
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Income & Stats Tab */}
      {activeTab === 'income' && !loading && (
        <div className="income-section">
          <h2>Income & Statistics</h2>
          
          <div className="detailed-stats">
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="income-card">
                  <div className="income-header">
                    <h3>{course.title}</h3>
                    <span className="price-label">{course.price > 0 ? `₹${course.price}` : 'FREE'}</span>
                  </div>
                  
                  <div className="income-details">
                    <div className="detail-row">
                      <span>Students Enrolled:</span>
                      <strong>{course.enrollments?.length || 0}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Total Lectures:</span>
                      <strong>{course.lectures?.length || 0}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Revenue from this course:</span>
                      <strong>₹{(course.price * (course.enrollments?.length || 0)).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="enrollment-list">
                    <h4>Recent Enrollments</h4>
                    {course.enrollments && course.enrollments.length > 0 ? (
                      <ul>
                        {course.enrollments.slice(0, 5).map((enrollment, idx) => (
                          <li key={idx}>
                            ✅ {enrollment.student?.name || 'Student'} - {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-enrollments">No enrollments yet</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">Create a course to see income statistics</p>
            )}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="messages-section">
          <Messaging currentUserId={user?.userId} currentUserRole="instructor" />
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            <h2>Create New Course</h2>
            
            <form onSubmit={handleCreateCourse} className="form">
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g., Advanced React Patterns"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Describe your course..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Course Level *</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (Weeks) *</label>
                  <input
                    type="number"
                    value={courseForm.weeks}
                    onChange={(e) => setCourseForm({ ...courseForm, weeks: parseInt(e.target.value) })}
                    min="1"
                    max="52"
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={courseForm.isPaid}
                    onChange={(e) => setCourseForm({ ...courseForm, isPaid: e.target.checked })}
                  />
                  Make This a Paid Course
                </label>
              </div>

              {courseForm.isPaid && (
                <div className="form-group">
                  <label>Course Price (₹) *</label>
                  <input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    placeholder="e.g., 499"
                    min="0"
                    required
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lecture Modal */}
      {showLectureModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowLectureModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowLectureModal(false)}>✕</button>
            <h2>Add Lecture to: {selectedCourse.title}</h2>
            
            <form onSubmit={handleAddLecture} className="form">
              <div className="form-group">
                <label>Lecture Title *</label>
                <input
                  type="text"
                  value={lectureForm.title}
                  onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                  placeholder="e.g., Introduction to React Hooks"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={lectureForm.description}
                  onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                  placeholder="What will students learn in this lecture?"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Video URL</label>
                <input
                  type="text"
                  value={lectureForm.videoUrl}
                  onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                  placeholder="Paste full URL, youtube.com/..., ?v=..., or just video ID"
                />
              </div>

              <div className="form-group">
                <label>Theory / Content</label>
                <textarea
                  value={lectureForm.theory}
                  onChange={(e) => setLectureForm({ ...lectureForm, theory: e.target.value })}
                  placeholder="Add theoretical content, notes, or concepts..."
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={lectureForm.duration}
                    onChange={(e) => setLectureForm({ ...lectureForm, duration: parseInt(e.target.value) })}
                    min="0"
                    placeholder="45"
                  />
                </div>

                <div className="form-group">
                  <label>Week Number</label>
                  <input
                    type="number"
                    value={lectureForm.week}
                    onChange={(e) => setLectureForm({ ...lectureForm, week: parseInt(e.target.value) })}
                    min="1"
                    max={selectedCourse.weeks}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowLectureModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Course Details */}
      {selectedCourse && !showLectureModal && (
        <div className="course-details-panel">
          <button className="close-btn" onClick={() => setSelectedCourse(null)}>✕</button>
          <h2>{selectedCourse.title}</h2>
          
          <div className="details-content">
            <div className="details-section">
              <h3>Course Information</h3>
              <p><strong>Description:</strong> {selectedCourse.description}</p>
              <p><strong>Category:</strong> {selectedCourse.category}</p>
              <p><strong>Level:</strong> {selectedCourse.level}</p>
              <p><strong>Duration:</strong> {selectedCourse.weeks} weeks</p>
              <p><strong>Price:</strong> {selectedCourse.price > 0 ? `₹${selectedCourse.price}` : 'FREE'}</p>
            </div>

            <div className="details-section">
              <h3>Lectures ({selectedCourse.lectures?.length || 0})</h3>
              {selectedCourse.lectures && selectedCourse.lectures.length > 0 ? (
                <div className="lectures-list">
                  {selectedCourse.lectures.map((lecture, idx) => (
                    <div key={idx} className="lecture-item">
                      <span className="lecture-number">Lecture {idx + 1}</span>
                      <span className="lecture-title">{lecture.title}</span>
                      <span className="lecture-week">Week {lecture.week}</span>
                      {lecture.hasQuiz && <span className="quiz-badge">📝 Quiz</span>}
                      <button
                        className="btn-add-quiz-inline"
                        onClick={() => {
                          setSelectedQuiz(null);
                          setQuizForm({ title: `Quiz: ${lecture.title}` });
                          setShowQuizModal(true);
                        }}
                      >
                        Add Quiz
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-lectures">No lectures added yet</p>
              )}

              <button 
                className="btn-add-lecture"
                onClick={() => setShowLectureModal(true)}
              >
                ➕ Add Lecture
              </button>
            </div>

            <div className="details-section">
              <h3>Quizzes</h3>
              <p className="section-note">Manage quizzes for this course</p>
              <button 
                className="btn-add-quiz"
                onClick={() => {
                  setSelectedQuiz(null);
                  setShowQuizModal(true);
                }}
              >
                ➕ Create Quiz
              </button>
              
              {selectedQuiz && (
                <div className="quiz-details">
                  <h4>Current Quiz: {selectedQuiz.title}</h4>
                  <button 
                    className="btn-add-question"
                    onClick={() => setShowQuestionModal(true)}
                  >
                    ➕ Add Question
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showQuizModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowQuizModal(false)}>✕</button>
            <h2>Create Quiz for: {selectedCourse.title}</h2>
            
            <form onSubmit={handleCreateQuiz} className="form">
              <div className="form-group">
                <label>Quiz Title *</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  placeholder="e.g., Chapter 1 Assessment"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowQuizModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showQuestionModal && selectedQuiz && (
        <div className="modal-overlay" onClick={() => setShowQuestionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowQuestionModal(false)}>✕</button>
            <h2>Add Question to: {selectedQuiz.title}</h2>
            
            <form onSubmit={handleAddQuestion} className="form">
              <div className="form-group">
                <label>Question *</label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  placeholder="Enter the question..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Answer Options *</label>
                <div className="options-group">
                  {questionForm.options.map((option, idx) => (
                    <div key={idx} className="option-input">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionForm.options];
                          newOptions[idx] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                        placeholder={`Option ${idx + 1}`}
                        required
                      />
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="correct"
                          checked={questionForm.correctAnswer === idx}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswer: idx })}
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowQuestionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
