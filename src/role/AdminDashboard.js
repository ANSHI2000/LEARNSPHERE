import React, { useState, useEffect } from 'react'
import { adminService } from '../services/admin'
import './AdminDashboard.css'

const AdminDashboard = ({ onLogout, user }) => {
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    loadAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAdminData = async () => {
    setLoading(true)
    
    // Load all users
    const { data: usersData, error: usersError } = await adminService.getAllUsers()
    if (!usersError && usersData) {
      setUsers(usersData)
    }

    // Load analytics
    const { data: analyticsData, error: analyticsError } = await adminService.getAnalytics()
    if (!analyticsError && analyticsData) {
      setAnalytics(analyticsData)
    }
    
    setLoading(false)
  }

  const handleApproveTeacher = async (teacherId) => {
    const { error } = await adminService.approveTeacher(teacherId)
    if (!error) {
      await loadAdminData()
      alert('Teacher approved successfully!')
    } else {
      alert('Failed to approve teacher: ' + error.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const { error } = await adminService.deleteUser(userId)
      if (!error) {
        await loadAdminData()
        alert('User deleted successfully!')
      } else {
        alert('Failed to delete user: ' + error.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>Welcome, {user.profile.full_name || 'Admin'}</p>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button 
            className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {activeTab === 'users' && (
          <div className="tab-content">
            <h2>User Management</h2>
            
            <div className="user-sections">
              <div className="user-section">
                <h3>All Users ({users.length})</h3>
                <div className="user-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.full_name || 'N/A'}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>
                            <span className={`status-badge ${user.approved ? 'approved' : 'pending'}`}>
                              {user.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            {user.role === 'teacher' && !user.approved && (
                              <button 
                                className="action-btn approve"
                                onClick={() => handleApproveTeacher(user.id)}
                              >
                                Approve
                              </button>
                            )}
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content">
            <h2>Platform Analytics</h2>
            
            <div className="analytics-cards">
              <div className="analytics-card">
                <h3>Total Students</h3>
                <p className="analytics-number">{analytics.totalStudents || 0}</p>
              </div>
              <div className="analytics-card">
                <h3>Total Teachers</h3>
                <p className="analytics-number">{analytics.totalTeachers || 0}</p>
              </div>
              <div className="analytics-card">
                <h3>Total Courses</h3>
                <p className="analytics-number">{analytics.totalCourses || 0}</p>
              </div>
              <div className="analytics-card">
                <h3>Total Enrollments</h3>
                <p className="analytics-number">{analytics.totalEnrollments || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard