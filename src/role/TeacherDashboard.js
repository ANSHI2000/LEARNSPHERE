import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiClient from '../api/apiClient';
import Messaging from './Messaging';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    level: 'beginner',
    weeks: 4
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Get all instructor's courses
      const response = await apiClient.courseAPI.getInstructorCourses();
      setCourses(response.data);
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
    setLoading(true);
    try {
      const response = await apiClient.courseAPI.create(formData);
      setCourses([...courses, response.data.course]);
      setFormData({ title: '', description: '', category: '', price: 0, level: 'beginner', weeks: 4 });
      setShowCreateCourse(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishCourse = async (courseId) => {
    setLoading(true);
    try {
      const response = await apiClient.courseAPI.publish(courseId);
      setCourses(courses.map(c => c.id === courseId ? response.data.course : c));
      setError(null);
    } catch (err) {
      setError('Failed to publish course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await apiClient.courseAPI.delete(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
      setError(null);
    } catch (err) {
      setError('Failed to delete course');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <p>Welcome, {user?.name}!</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          My Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          📧 Messages
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'courses' && (
        <div className="courses-section">
          <div className="section-header">
            <h2>Your Courses</h2>
            <button
              className="btn-primary"
              onClick={() => setShowCreateCourse(!showCreateCourse)}
            >
              {showCreateCourse ? 'Cancel' : '+ Create Course'}
            </button>
          </div>

          {showCreateCourse && (
            <div className="create-course-form">
              <form onSubmit={handleCreateCourse}>
                <input
                  type="text"
                  placeholder="Course Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Course Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                />
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input
                  type="number"
                  placeholder="Number of Weeks"
                  value={formData.weeks}
                  onChange={(e) => setFormData({...formData, weeks: parseInt(e.target.value)})}
                  min="1"
                  max="52"
                />
                <input
                  type="number"
                  placeholder="Price (0 for free)"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  min="0"
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Course'}
                </button>
              </form>
            </div>
          )}

          {loading && <p>Loading courses...</p>}

          <div className="courses-grid">
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="course-card">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-info">
                    <span>Category: {course.category}</span>
                    <span>Status: {course.published ? 'Published' : 'Draft'}</span>
                  </div>
                  <div className="course-buttons">
                    {!course.published && (
                      <button 
                        className="btn-success"
                        onClick={() => handlePublishCourse(course.id)}
                      >
                        Publish
                      </button>
                    )}
                    <button 
                      className="btn-info"
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
              <p className="no-courses">No courses yet. Create your first course!</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h2>Coming Soon</h2>
          <p>Course analytics will appear here</p>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-section">
          <Messaging currentUserId={user?.id} currentUserRole="instructor" />
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
