import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiClient from '../api/apiClient';
import Messaging from './Messaging';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0
  });

  useEffect(() => {
    fetchCourses();
    fetchStats();
  }, []);

  const fetchCourses = async () => {
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

  const fetchStats = async () => {
    try {
      const response = await apiClient.courseAPI.getInstructorStats?.();
      if (response) {
        setStats(response.data);
      }
    } catch (err) {
      console.log('Stats not available yet');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      setError('Title and category are required');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.courseAPI.create(formData);
      setCourses([...courses, response.data.course]);
      setFormData({ title: '', description: '', category: '', price: 0 });
      setShowCreateCourse(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await apiClient.courseAPI.delete(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
      setError(null);
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  const handlePublishCourse = async (courseId, published) => {
    try {
      // Call API to update course publish status
      await apiClient.courseAPI.update(courseId, { published: !published });
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, published: !published } : c
      ));
    } catch (err) {
      setError('Failed to update course status');
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>{courses.length}</h3>
          <p>Total Courses</p>
        </div>
        <div className="stat-card">
          <h3>{courses.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0)}</h3>
          <p>Total Students</p>
        </div>
        <div className="stat-card">
          <h3>₹{courses.reduce((sum, c) => sum + (c.price || 0) * (c.enrollments?.filter(e => e.paymentStatus === 'paid').length || 0), 0)}</h3>
          <p>Revenue</p>
        </div>
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
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students Progress
        </button>
        <button
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          📧 Messages
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <p className="loading">Loading...</p>}

      {/* Courses Tab */}
      {activeTab === 'courses' && !loading && (
        <div className="courses-section">
          <div className="section-header">
            <h2>My Courses</h2>
            <button 
              className="btn-primary"
              onClick={() => setShowCreateCourse(!showCreateCourse)}
            >
              {showCreateCourse ? '✕ Cancel' : '+ Create Course'}
            </button>
          </div>

          {/* Create Course Form */}
          {showCreateCourse && (
            <form className="course-form" onSubmit={handleCreateCourse}>
              <input
                type="text"
                placeholder="Course Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Course Description"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
              </select>
              <input
                type="number"
                placeholder="Price (₹)"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                min="0"
              />
              <button type="submit" className="btn-primary">Create Course</button>
            </form>
          )}

          {/* Courses List */}
          <div className="courses-grid">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-header">
                    <h3>{course.title}</h3>
                    <span className={`status-badge ${course.published ? 'published' : 'draft'}`}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="course-desc">{course.description}</p>
                  <div className="course-info">
                    <span>📚 {course.lectures?.length || 0} Lectures</span>
                    <span>💰 ₹{course.price}</span>
                    <span>👥 {course.enrollments?.length || 0} Students</span>
                  </div>
                  <div className="course-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => handlePublishCourse(course.id, course.published)}
                    >
                      {course.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => setSelectedCourse(course)}
                    >
                      Manage
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
              <p className="empty-state">No courses yet. Create your first course!</p>
            )}
          </div>
        </div>
      )}

      {/* Students Progress Tab */}
      {activeTab === 'students' && !loading && (
        <div className="students-section">
          <h2>Students Progress</h2>
          <div className="students-list">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="course-students">
                  <h3>{course.title}</h3>
                  {course.enrollments && course.enrollments.length > 0 ? (
                    <div className="students-table">
                      <div className="table-header">
                        <div>Student Name</div>
                        <div>Email</div>
                        <div>Status</div>
                        <div>Enrolled Date</div>
                      </div>
                      {course.enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="table-row">
                          <div>{enrollment.student?.name || 'Unknown'}</div>
                          <div>{enrollment.student?.email || 'N/A'}</div>
                          <div className="payment-status">{enrollment.paymentStatus}</div>
                          <div>{new Date(enrollment.enrolledAt).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No students enrolled yet</p>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-state">Create courses to see student progress</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-section">
          <Messaging currentUserId={user?.userId} currentUserRole="instructor" />
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
