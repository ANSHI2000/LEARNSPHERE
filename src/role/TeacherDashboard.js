import React, { useState, useEffect } from 'react'
import { courseService } from '../services/courses'
import './TeacherDashboard.css'

const TeacherDashboard = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('courses')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    duration: '',
    thumbnail_url: '',
    status: 'draft'
  })

  useEffect(() => {
    console.log('TeacherDashboard mounted with user:', user)
    loadTeacherCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTeacherCourses = async () => {
    console.log('Loading teacher courses...')
    setLoading(true)
    setError(null)
    const { data, error } = await courseService.getTeacherCourses(user.profile.id)
    if (error) {
      console.error('Error loading courses:', error)
      setError('Failed to load courses: ' + error.message)
    } else if (data) {
      console.log('Loaded courses:', data)
      setCourses(data)
    }
    setLoading(false)
  }

  const handleCreateCourse = async () => {
    console.log('Create course button clicked!')
    
    if (!newCourse.title || !newCourse.description) {
      alert('Please fill in title and description')
      return
    }

    const courseData = {
      title: newCourse.title,
      description: newCourse.description,
      level: newCourse.level,
      duration: newCourse.duration,
      thumbnail_url: newCourse.thumbnail_url,
      instructor_id: user.profile.id,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await courseService.createCourse(courseData)
    if (error) {
      alert('Failed to create course: ' + error.message)
    } else {
      await loadTeacherCourses()
      setNewCourse({
        title: '',
        description: '',
        level: 'Beginner',
        duration: '',
        thumbnail_url: '',
        status: 'draft'
      })
      setShowCreateForm(false)
      alert('Course created successfully!')
    }
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse.title || !editingCourse.description) {
      alert('Please fill in title and description')
      return
    }

    const updates = {
      title: editingCourse.title,
      description: editingCourse.description,
      level: editingCourse.level,
      duration: editingCourse.duration,
      thumbnail_url: editingCourse.thumbnail_url,
      updated_at: new Date().toISOString()
    }
    
    const { error } = await courseService.updateCourse(editingCourse.id, updates)
    if (error) {
      alert('Failed to update course: ' + error.message)
    } else {
      await loadTeacherCourses()
      setShowEditModal(false)
      setEditingCourse(null)
      alert('Course updated successfully!')
    }
  }

  const handlePublishCourse = async (courseId) => {
    console.log('Publishing course:', courseId)
    const { error } = await courseService.updateCourse(courseId, { status: 'published' })
    if (error) {
      alert('Failed to publish course: ' + error.message)
    } else {
      await loadTeacherCourses()
      alert('Course published!')
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const { error } = await courseService.deleteCourse(courseId)
      if (error) {
        alert('Failed to delete course: ' + error.message)
      } else {
        await loadTeacherCourses()
        alert('Course deleted successfully!')
      }
    }
  }

  const openEditModal = (course) => {
    console.log('Opening edit modal for course:', course)
    setEditingCourse({ ...course })
    setShowEditModal(true)
  }

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your courses...</p>
      </div>
    )
  }

  return (
    <div className="teacher-dashboard">
      {/* Sidebar */}
      <div className="teacher-sidebar">
        <div className="sidebar-header">
          <h2>Teacher Panel</h2>
          <p>Welcome, {user.profile.full_name || 'Teacher'}</p>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📚 My Courses
          </button>
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="teacher-main">
        {activeTab === 'courses' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>My Courses</h2>
              <button 
                className="create-btn"
                onClick={toggleCreateForm}
              >
                {showCreateForm ? 'Cancel' : '+ Create New Course'}
              </button>
            </div>

            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Create Course Form */}
            {showCreateForm && (
              <div className="create-course-form">
                <h3>Create New Course</h3>
                <div className="form-group">
                  <label>Course Title *</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="e.g., Introduction to React"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    placeholder="Course description..."
                    rows="4"
                  />
                </div>

                <div className="form-row">
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

                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      placeholder="e.g., 8 weeks"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Thumbnail URL</label>
                  <input
                    type="text"
                    value={newCourse.thumbnail_url}
                    onChange={(e) => setNewCourse({ ...newCourse, thumbnail_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-actions">
                  <button className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                  <button className="submit-btn" onClick={handleCreateCourse}>
                    Create Course
                  </button>
                </div>
              </div>
            )}

            {/* Courses List */}
            {courses.length === 0 ? (
              <p>You haven't created any courses yet. Click "Create New Course" to get started!</p>
            ) : (
              <div className="courses-grid">
                {courses.map(course => (
                  <div key={course.id} className="course-card">
                    <img 
                      src={course.thumbnail_url || 'https://via.placeholder.com/300x200'} 
                      alt={course.title} 
                      className="course-thumbnail"
                    />
                    <div className="course-info">
                      <h3>{course.title}</h3>
                      <p className="course-description">{course.description?.substring(0, 100)}...</p>
                      <div className="course-meta">
                        <span className={`course-status ${course.status}`}>
                          {course.status}
                        </span>
                        <span>{course.enrollments?.[0]?.count || 0} students</span>
                        <span>{course.duration}</span>
                      </div>
                      <div className="course-actions">
                        <button 
                          className="action-btn edit"
                          onClick={() => openEditModal(course)}
                        >
                          Edit
                        </button>
                        {course.status === 'draft' && (
                          <button 
                            className="action-btn publish"
                            onClick={() => handlePublishCourse(course.id)}
                          >
                            Publish
                          </button>
                        )}
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Course</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="Course title"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  placeholder="Course description"
                  rows="5"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={editingCourse.level}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={editingCourse.duration || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    placeholder="e.g., 8 weeks"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Thumbnail URL</label>
                <input
                  type="text"
                  value={editingCourse.thumbnail_url || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingCourse.status}
                  onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleUpdateCourse}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard