import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiClient from '../api/apiClient';
import AdminAnalytics from './AdminAnalytics';
import { FiUsers, FiBookOpen, FiBarChart2, FiLogOut, FiGrid, FiChevronRight, FiMenu, FiX } from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    instructors: 0,
    students: 0,
    completedEnrollments: 0,
    completionRate: 0
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    if (activeTab === 'analytics') {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const response = await apiClient.adminAPI.getStats();
        setStats(response.data);
      } else if (activeTab === 'users') {
        const response = await apiClient.adminAPI.getAllUsers();
        setUsers(response.data);
      } else if (activeTab === 'courses') {
        const response = await apiClient.adminAPI.getAllCourses();
        setCourses(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'stats', label: 'Overview', icon: FiGrid },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'courses', label: 'Courses', icon: FiBookOpen }
  ];

  const renderContent = () => {
    if (loading && activeTab !== 'analytics') {
      return <div className="loading"><div className="spinner"></div> Loading...</div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }

    switch (activeTab) {
      case 'stats':
        return (
          <div className="content-section">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card gradient-1">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <p className="stat-label">Total Users</p>
                  <p className="stat-value">{stats.totalUsers}</p>
                  <small>{stats.students} Students • {stats.instructors} Instructors</small>
                </div>
              </div>
              <div className="stat-card gradient-2">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <p className="stat-label">Total Courses</p>
                  <p className="stat-value">{stats.totalCourses}</p>
                  <small>Active courses</small>
                </div>
              </div>
              <div className="stat-card gradient-3">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <p className="stat-label">Total Enrollments</p>
                  <p className="stat-value">{stats.totalEnrollments}</p>
                  <small>{stats.completedEnrollments} completed</small>
                </div>
              </div>
              <div className="stat-card gradient-4">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <p className="stat-label">Completion Rate</p>
                  <p className="stat-value">{stats.completionRate}%</p>
                  <small>Overall progress</small>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return <AdminAnalytics />;
      case 'users':
        return (
          <div className="content-section">
            <h2>User Management</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="empty-state">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'courses':
        return (
          <div className="content-section">
            <h2>Course Management</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Instructor</th>
                    <th>Category</th>
                    <th>Enrollments</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses && courses.length > 0 ? (
                    courses.map((course) => (
                      <tr key={course.id}>
                        <td><strong>{course.title}</strong></td>
                        <td>{course.instructor?.name || 'N/A'}</td>
                        <td>{course.category}</td>
                        <td><span className="enrollment-badge">{course.enrollments?.length || 0}</span></td>
                        <td><span className={`status-badge status-${course.published ? 'published' : 'draft'}`}>
                          {course.published ? 'Published' : 'Draft'}
                        </span></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="empty-state">No courses found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">LS</div>
          <div className="brand-text">
            <h3>LearnSphere</h3>
            <p>Admin</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
              >
                <Icon className="menu-icon" size={20} />
                <span className="menu-label">{item.label}</span>
                {activeTab === item.id && <FiChevronRight className="menu-indicator" size={18} />}
              </button>
            );
          })}
        </nav>

        <button className="logout-btn" onClick={logout} title="Logout">
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-main">
        <div className="main-header">
          <div className="header-content">
            <h1>Dashboard</h1>
            <p>Welcome back, <strong>{user?.name || 'Admin'}</strong>! 👋</p>
          </div>
          <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        <div className="main-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
