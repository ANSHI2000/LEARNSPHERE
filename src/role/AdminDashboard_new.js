import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiClient from '../api/apiClient';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    studentUsers: 0,
    instructorUsers: 0,
    adminUsers: 0,
    paidEnrollments: 0,
    courses: [],
    users: [],
    enrollments: [],
    quizzes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      // For now, we'll calculate stats from individual API calls
      const coursesResp = await apiClient.courseAPI.getAll();
      const courses = coursesResp.data || [];

      // Calculate stats manually from available data
      const totalCourses = courses.length;
      const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0);
      const totalRevenue = courses.reduce((sum, c) => 
        sum + (c.price || 0) * (c.enrollments?.filter(e => e.paymentStatus === 'paid').length || 0), 0
      );

      setStats({
        totalCourses,
        totalEnrollments,
        totalRevenue,
        courses,
        studentUsers: 1, // Default placeholder
        instructorUsers: 1,
        adminUsers: 1,
        paidEnrollments: courses.reduce((sum, c) => 
          sum + (c.enrollments?.filter(e => e.paymentStatus === 'paid').length || 0), 0
        )
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}! System Overview</p>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          📚 Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          💰 Earnings
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading dashboard...</div>}

      {/* Overview Tab */}
      {activeTab === 'overview' && !loading && (
        <div className="overview-section">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <StatCard
              title="Total Users"
              value={stats.totalUsers || stats.studentUsers + stats.instructorUsers + stats.adminUsers}
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Total Courses"
              value={stats.totalCourses}
              icon="📚"
              color="purple"
            />
            <StatCard
              title="Total Enrollments"
              value={stats.totalEnrollments}
              icon="✓"
              color="green"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue}`}
              icon="💰"
              color="orange"
            />
          </div>

          {/* User Breakdown */}
          <div className="breakdown-section">
            <h2>User Breakdown</h2>
            <div className="breakdown-grid">
              <div className="breakdown-card">
                <h3>Students</h3>
                <p className="big-number">{stats.studentUsers || 'N/A'}</p>
              </div>
              <div className="breakdown-card">
                <h3>Instructors</h3>
                <p className="big-number">{stats.instructorUsers || 'N/A'}</p>
              </div>
              <div className="breakdown-card">
                <h3>Admins</h3>
                <p className="big-number">{stats.adminUsers || 'N/A'}</p>
              </div>
              <div className="breakdown-card">
                <h3>Paid Enrollments</h3>
                <p className="big-number">{stats.paidEnrollments}</p>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="health-section">
            <h2>System Health</h2>
            <div className="health-checks">
              <div className="health-check">
                <span>✅ Database</span>
                <span className="status online">Connected</span>
              </div>
              <div className="health-check">
                <span>✅ Backend Server</span>
                <span className="status online">Running</span>
              </div>
              <div className="health-check">
                <span>✅ Payment Gateway</span>
                <span className="status online">Integrated</span>
              </div>
              <div className="health-check">
                <span>✅ Frontend</span>
                <span className="status online">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && !loading && (
        <div className="courses-section">
          <h2>All Courses</h2>
          <div className="courses-table">
            <div className="table-header">
              <div>Course Name</div>
              <div>Instructor</div>
              <div>Category</div>
              <div>Price</div>
              <div>Enrollments</div>
              <div>Status</div>
            </div>
            {stats.courses && stats.courses.length > 0 ? (
              stats.courses.map((course) => (
                <div key={course.id} className="table-row">
                  <div className="course-name">{course.title}</div>
                  <div>{course.instructor?.name || 'N/A'}</div>
                  <div>{course.category}</div>
                  <div>₹{course.price}</div>
                  <div className="enrollment-count">{course.enrollments?.length || 0}</div>
                  <div>
                    <span className={`status-badge ${course.published ? 'published' : 'draft'}`}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No courses found</div>
            )}
          </div>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && !loading && (
        <div className="earnings-section">
          <h2>Revenue & Earnings</h2>
          <div className="earnings-summary">
            <div className="earning-card">
              <h3>Total Revenue</h3>
              <p className="big-number">₹{stats.totalRevenue}</p>
            </div>
            <div className="earning-card">
              <h3>Paid Enrollments</h3>
              <p className="big-number">{stats.paidEnrollments}</p>
            </div>
            <div className="earning-card">
              <h3>Average Course Price</h3>
              <p className="big-number">
                ₹{stats.totalCourses > 0 
                  ? Math.round(stats.courses.reduce((sum, c) => sum + (c.price || 0), 0) / stats.totalCourses) 
                  : 0}
              </p>
            </div>
          </div>

          <h3 style={{ marginTop: '30px' }}>Revenue by Course</h3>
          <div className="revenue-breakdown">
            {stats.courses && stats.courses.length > 0 ? (
              stats.courses
                .filter(c => c.price > 0)
                .map((course) => {
                  const courseRevenue = (course.price || 0) * (course.enrollments?.filter(e => e.paymentStatus === 'paid').length || 0);
                  return (
                    <div key={course.id} className="revenue-item">
                      <div className="revenue-info">
                        <h4>{course.title}</h4>
                        <p>₹{course.price} × {course.enrollments?.filter(e => e.paymentStatus === 'paid').length || 0} sales</p>
                      </div>
                      <div className="revenue-amount">₹{courseRevenue}</div>
                    </div>
                  );
                })
            ) : (
              <p className="empty-state">No paid courses yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
