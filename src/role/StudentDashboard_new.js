import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiClient from '../api/apiClient';
import Messaging from './Messaging';
import DashboardHeader from '../components/DashboardHeader';
import { getPlayableVideoUrl } from '../utils/formatters';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseQuizzes, setSelectedCourseQuizzes] = useState([]);
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [paymentInProgress, setPaymentInProgress] = useState({});
  const [totalCourses, setTotalCourses] = useState(0);

  const fetchTotalCourses = async () => {
    try {
      const response = await apiClient.courseAPI.getAll();
      setTotalCourses(response.data?.length || 0);
    } catch (err) {
      console.error('Error fetching total courses:', err);
    }
  };

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'enrolled') {
        const response = await apiClient.enrollmentAPI.getMyCourses();
        setEnrolledCourses(response.data || []);
      } else if (activeTab === 'browse') {
        const [courseResponse, enrollmentResponse] = await Promise.all([
          apiClient.courseAPI.getAll(),
          apiClient.enrollmentAPI.getMyCourses(),
        ]);
        setAvailableCourses(courseResponse.data || []);
        setEnrolledCourses(enrollmentResponse.data || []);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTotalCourses();
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handlePayment = async (course) => {
    const alreadyEnrolled = enrolledCourseIds.has(course.id);
    if (alreadyEnrolled) {
      setError(null);
      setInfoMessage('You are already enrolled in this course.');
      return;
    }

    if (course.price === 0) {
      // Free course - enroll directly
      handleEnrollFree(course.id);
      return;
    }

    setPaymentInProgress({ ...paymentInProgress, [course.id]: true });

    try {
      // For testing/demo, simulate payment success
      // In production, integrate real Razorpay here
      
      const simulatedPaymentData = {
        razorpay_order_id: `order_${Date.now()}`,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: `sig_${Date.now()}`
      };

      // Show confirmation dialog
      const confirmed = window.confirm(
        `💳 Enrollment Fee: ₹${course.price}\n\nDo you want to enroll in "${course.title}"?\n\n(This is a demo - no real payment)\n\nClick OK to confirm enrollment.`
      );

      if (!confirmed) {
        setPaymentInProgress({ ...paymentInProgress, [course.id]: false });
        return;
      }

      // Verify payment with backend
      await handlePaymentSuccess(simulatedPaymentData, course.id);
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error(err);
      setPaymentInProgress({ ...paymentInProgress, [course.id]: false });
    }
  };

  const handlePaymentSuccess = async (paymentData, courseId) => {
    try {
      // Verify payment with backend
      const response = await apiClient.paymentAPI?.verifyPayment({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        courseId
      });

      if (response && response.data) {
        // Payment successful - refresh courses
        setPaymentInProgress({ ...paymentInProgress, [courseId]: false });
        setActiveTab('enrolled');
        fetchStudentData();
        setError(null);
        setInfoMessage(null);
        alert('🎉 Payment successful! Course enrolled successfully!');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      const backendError = err.response?.data?.error || err.message;
      if (backendError?.toLowerCase().includes('already enrolled')) {
        setError(null);
        setInfoMessage('You are already enrolled in this course.');
      } else {
        setError('Payment verification failed: ' + backendError);
      }
      setPaymentInProgress({ ...paymentInProgress, [courseId]: false });
    }
  };

  const handleEnrollFree = async (courseId) => {
    try {
      await apiClient.enrollmentAPI.enroll(courseId);
      setActiveTab('enrolled');
      fetchStudentData();
      setInfoMessage(null);
      alert('✅ Enrolled successfully!');
    } catch (err) {
      const backendError = err.response?.data?.error || 'Enrollment failed';
      if (backendError?.toLowerCase().includes('already enrolled')) {
        setError(null);
        setInfoMessage('You are already enrolled in this course.');
      } else {
        setError(backendError);
      }
    }
  };

  const enrolledCourseIds = new Set(
    (enrolledCourses || []).map((enrollment) => enrollment.courseId ?? enrollment.course?.id)
  );

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setLoadingCourseDetails(true);
    try {
      const quizResponse = await apiClient.quizAPI.getByCourse(course.id);
      setSelectedCourseQuizzes(quizResponse.data || []);
    } catch (err) {
      console.error('Failed to fetch course quizzes:', err);
      setSelectedCourseQuizzes([]);
    } finally {
      setLoadingCourseDetails(false);
    }
  };

  return (
    <div className="student-dashboard">
      <DashboardHeader title="Student Dashboard" userName={user?.name} onLogout={logout} />

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'enrolled' ? 'active' : ''}`}
          onClick={() => setActiveTab('enrolled')}
        >
          My Enrolled Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          📧 Messages
        </button>
      </div>

      {/* Statistics Counter */}
      <div className="statistics-section">
        <div className="stat-card stat-total">
          <h3>📚 Total Courses</h3>
          <p className="stat-number">{totalCourses}</p>
          <p className="stat-label">Available on Platform</p>
        </div>
        <div className="stat-card stat-enrolled">
          <h3>✅ Enrolled Courses</h3>
          <p className="stat-number">{enrolledCourses.length}</p>
          <p className="stat-label">Active enrollments</p>
        </div>
        <div className="stat-card stat-remaining">
          <h3>🎯 To Explore</h3>
          <p className="stat-number">{Math.max(0, totalCourses - enrolledCourses.length)}</p>
          <p className="stat-label">Available for enrollment</p>
        </div>
        <div className="stat-card stat-progress">
          <h3>🔥 Progress</h3>
          <p className="stat-number">
            {totalCourses > 0 ? Math.round((enrolledCourses.length / totalCourses) * 100) : 0}%
          </p>
          <p className="stat-label">Enrollment progress</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {infoMessage && <div className="success-message">{infoMessage}</div>}
      {loading && <p className="loading">Loading courses...</p>}

      {/* Enrolled Courses */}
      {activeTab === 'enrolled' && !loading && (
        <div className="enrolled-section">
          <h2>My Enrolled Courses</h2>
          <div className="courses-grid">
            {enrolledCourses && enrolledCourses.length > 0 ? (
              enrolledCourses.map((enrollment) => (
                <div key={enrollment.id} className="course-card">
                  <h3>{enrollment.course?.title}</h3>
                  <p>{enrollment.course?.description}</p>
                  <div className="course-meta">
                    <span>👨‍🏫 Instructor: {enrollment.course?.instructor?.name}</span>
                    <span>📚 Category: {enrollment.course?.category}</span>
                  </div>
                  <div className="course-status">
                    <p>Status: <strong>{enrollment.paymentStatus}</strong></p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => handleCourseSelect(enrollment.course)}
                  >
                    View Course
                  </button>
                </div>
              ))
            ) : (
              <p className="no-courses">No enrolled courses yet. Browse courses to get started!</p>
            )}
          </div>
        </div>
      )}

      {/* Browse Courses */}
      {activeTab === 'browse' && !loading && (
        <div className="browse-section">
          <h2>Available Courses</h2>
          <div className="courses-grid">
            {availableCourses && availableCourses.length > 0 ? (
              availableCourses.map((course) => (
                <div key={course.id} className="course-card">
                  {enrolledCourseIds.has(course.id) && <div className="enrolled-tag">✅ Already Enrolled</div>}
                  <div className="price-badge">
                    {course.price === 0 ? '🆓 FREE' : `₹${course.price}`}
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span>👨‍🏫 {course.instructor?.name}</span>
                    <span>📚 {course.category}</span>
                    <span>📝 {course.lectures?.length || 0} Lectures</span>
                  </div>
                  <div className="course-stats">
                    <p>👥 {course.enrollments?.length || 0} Students Enrolled</p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => handlePayment(course)}
                    disabled={paymentInProgress[course.id] || enrolledCourseIds.has(course.id)}
                  >
                    {paymentInProgress[course.id] 
                      ? '⏳ Processing...' 
                      : enrolledCourseIds.has(course.id)
                      ? 'Already Enrolled'
                      : course.price === 0 ? 'Enroll for Free' : `Enroll (₹${course.price})`}
                  </button>
                </div>
              ))
            ) : (
              <p className="no-courses">No courses available right now.</p>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {activeTab === 'messages' && (
        <div className="messages-section">
          <Messaging currentUserId={user?.userId} currentUserRole="student" />
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="course-details-modal" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCourse(null)}>✕</button>
            <h2>{selectedCourse.title}</h2>
            <p className="modal-description">{selectedCourse.description}</p>
            <div className="modal-meta">
              <span>👨‍🏫 Instructor: {selectedCourse.instructor?.name}</span>
              <span>📚 Category: {selectedCourse.category}</span>
              <span>📝 {selectedCourse.lectures?.length || 0} Lectures</span>
            </div>

            <div className="student-course-content">
              <h3>Course Lectures</h3>
              {selectedCourse.lectures && selectedCourse.lectures.length > 0 ? (
                selectedCourse.lectures.map((lecture, index) => (
                  <div key={lecture.id || index} className="student-lecture-card">
                    <h4>Lecture {index + 1}: {lecture.title}</h4>
                    {lecture.description && <p className="lecture-description">{lecture.description}</p>}

                    {getPlayableVideoUrl(lecture.videoUrl) ? (
                      <a
                        href={getPlayableVideoUrl(lecture.videoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="video-link"
                      >
                        ▶️ Watch Video
                      </a>
                    ) : (
                      <p className="no-video">Video link unavailable. Ask instructor to update it.</p>
                    )}

                    {lecture.theory && (
                      <div className="lecture-theory">
                        <strong>Topic Notes:</strong>
                        <p>{lecture.theory}</p>
                      </div>
                    )}

                  </div>
                ))
              ) : (
                <p className="no-courses">No lectures added yet.</p>
              )}

              <h3>Course Quizzes</h3>
              {loadingCourseDetails ? (
                <p className="loading">Loading quizzes...</p>
              ) : selectedCourseQuizzes.length > 0 ? (
                <div className="student-quiz-list">
                  {selectedCourseQuizzes.map((quiz) => (
                    <div key={quiz.id} className="student-quiz-card">
                      <div className="quiz-card-header">
                        <div>
                          <h4>{quiz.title}</h4>
                          <p className="quiz-meta">
                            📝 {quiz.questions?.length || 0} Questions | ⏱️ {(quiz.questions?.length || 10) * 60} seconds
                          </p>
                        </div>
                      </div>
                      <div className="quiz-card-actions">
                        <a 
                          href={`/quiz/take/${quiz.id}`}
                          className="btn-quiz-start"
                        >
                          ▶️ Start Quiz
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-courses">No quiz added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
