import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiClient from '../api/apiClient';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student data
  useEffect(() => {
    fetchStudentData();
  }, [activeTab]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'enrolled') {
        // Fetch enrolled courses
        const response = await apiClient.enrollmentAPI.getMyCourses();
        setEnrolledCourses(response.data);
      } else if (activeTab === 'browse') {
        // Fetch available courses
        const response = await apiClient.courseAPI.getAll();
        setAvailableCourses(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await apiClient.enrollmentAPI.enroll(courseId);
      setError(null);
      // Refresh available courses and move to enrolled tab
      setActiveTab('enrolled');
      fetchStudentData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enroll in course');
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Welcome, {user?.name}!</p>
      </div>

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
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <p className="loading">Loading courses...</p>}

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
                    <span>Instructor: {enrollment.course?.instructor?.name}</span>
                    <span>Category: {enrollment.course?.category}</span>
                  </div>
                  <div className="course-status">
                    <p>Status: {enrollment.paymentStatus}</p>
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

      {activeTab === 'browse' && !loading && (
        <div className="browse-section">
          <h2>Available Courses</h2>
          <div className="courses-grid">
            {availableCourses && availableCourses.length > 0 ? (
              availableCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span>Instructor: {course.instructor?.name}</span>
                    <span>Category: {course.category}</span>
                    <span>Price: {course.price === 0 ? 'Free' : `$${course.price}`}</span>
                  </div>
                  <div className="course-rating">
                    <p>Enrolled: {course.lectures?.length} lectures</p>
                  </div>
                  <button
                    className="btn-success"
                    onClick={() => handleEnroll(course.id)}
                  >
                    Enroll Now
                  </button>
                </div>
              ))
            ) : (
              <p className="no-courses">No courses available right now.</p>
            )}
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="course-details-modal" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCourse(null)}>×</button>
            <h2>{selectedCourse.title}</h2>
            <p>{selectedCourse.description}</p>
            <div className="modal-info">
              <p><strong>Category:</strong> {selectedCourse.category}</p>
              <p><strong>Lectures:</strong> {selectedCourse.lectures?.length}</p>
            </div>
            <button className="btn-primary" onClick={() => setSelectedCourse(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
