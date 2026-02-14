import React, { useState } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState({
    students: [
      { id: 1, name: 'John Doe', email: 'john@student.edu', status: 'active', joinDate: '2024-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@student.edu', status: 'active', joinDate: '2024-02-20' },
      { id: 3, name: 'Bob Johnson', email: 'bob@student.edu', status: 'inactive', joinDate: '2024-01-10' },
    ],
    teachers: [
      { id: 1, name: 'Dr. Sarah Wilson', email: 'sarah@teacher.edu', status: 'approved', department: 'Computer Science', joinDate: '2023-08-15' },
      { id: 2, name: 'Prof. Michael Brown', email: 'michael@teacher.edu', status: 'pending', department: 'Mathematics', joinDate: '2024-03-01' },
      { id: 3, name: 'Dr. Emily Davis', email: 'emily@teacher.edu', status: 'approved', department: 'Physics', joinDate: '2023-09-10' },
      { id: 4, name: 'Prof. David Lee', email: 'david@teacher.edu', status: 'pending', department: 'Chemistry', joinDate: '2024-02-28' },
    ]
  });

  const [analytics, setAnalytics] = useState({
    totalStudents: 1250,
    totalTeachers: 45,
    pendingApprovals: 3,
    activeCourses: 78,
    monthlyActiveUsers: 890,
    platformUsage: 78,
    popularCategories: [
      { name: 'Computer Science', count: 45 },
      { name: 'Mathematics', count: 32 },
      { name: 'Physics', count: 28 },
      { name: 'Chemistry', count: 25 },
      { name: 'Literature', count: 20 },
    ]
  });

  const [categories, setCategories] = useState([
    { id: 1, name: 'Computer Science', courseCount: 45, status: 'active' },
    { id: 2, name: 'Mathematics', courseCount: 32, status: 'active' },
    { id: 3, name: 'Physics', courseCount: 28, status: 'active' },
    { id: 4, name: 'Chemistry', courseCount: 25, status: 'active' },
    { id: 5, name: 'Literature', courseCount: 20, status: 'inactive' },
    { id: 6, name: 'History', courseCount: 15, status: 'active' },
  ]);

  const [policies, setPolicies] = useState([
    { id: 1, title: 'User Agreement', lastUpdated: '2024-01-15', status: 'active' },
    { id: 2, title: 'Privacy Policy', lastUpdated: '2024-02-01', status: 'active' },
    { id: 3, title: 'Teacher Guidelines', lastUpdated: '2024-02-20', status: 'active' },
    { id: 4, title: 'Course Creation Policy', lastUpdated: '2024-01-10', status: 'draft' },
  ]);

  const [newCategory, setNewCategory] = useState('');
  const [newPolicy, setNewPolicy] = useState({ title: '', content: '' });

  const handleApproveTeacher = (teacherId) => {
    setUsers(prev => ({
      ...prev,
      teachers: prev.teachers.map(teacher =>
        teacher.id === teacherId ? { ...teacher, status: 'approved' } : teacher
      )
    }));
  };

  const handleRejectTeacher = (teacherId) => {
    setUsers(prev => ({
      ...prev,
      teachers: prev.teachers.filter(teacher => teacher.id !== teacherId)
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([
        ...categories,
        {
          id: categories.length + 1,
          name: newCategory,
          courseCount: 0,
          status: 'active'
        }
      ]);
      setNewCategory('');
    }
  };

  const handleToggleCategory = (categoryId) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, status: cat.status === 'active' ? 'inactive' : 'active' } : cat
    ));
  };

  const handleAddPolicy = () => {
    if (newPolicy.title.trim() && newPolicy.content.trim()) {
      setPolicies([
        ...policies,
        {
          id: policies.length + 1,
          title: newPolicy.title,
          lastUpdated: new Date().toISOString().split('T')[0],
          status: 'draft'
        }
      ]);
      setNewPolicy({ title: '', content: '' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('adminAuthenticated');
    
    window.location.href = '/';
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>Welcome, Admin</p>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button 
            className={`nav-btn ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            ✅ Teacher Approvals
            {users.teachers.filter(t => t.status === 'pending').length > 0 && (
              <span className="notification-badge">
                {users.teachers.filter(t => t.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Platform Analytics
          </button>
          <button 
            className={`nav-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            📚 Categories
          </button>
          <button 
            className={`nav-btn ${activeTab === 'policies' ? 'active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            ⚖️ Policies
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="admin-main">
        {activeTab === 'users' && (
          <div className="tab-content">
            <h2>User Management</h2>
            
            <div className="user-sections">
              <div className="user-section">
                <h3>Students ({users.students.length})</h3>
                <div className="user-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Join Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.students.map(student => (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>
                            <span className={`status-badge ${student.status}`}>
                              {student.status}
                            </span>
                          </td>
                          <td>{student.joinDate}</td>
                          <td>
                            <button className="action-btn view">View</button>
                            <button className="action-btn suspend">Suspend</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="user-section">
                <h3>Teachers ({users.teachers.length})</h3>
                <div className="user-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Join Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.teachers.map(teacher => (
                        <tr key={teacher.id}>
                          <td>{teacher.name}</td>
                          <td>{teacher.email}</td>
                          <td>{teacher.department}</td>
                          <td>
                            <span className={`status-badge ${teacher.status}`}>
                              {teacher.status}
                            </span>
                          </td>
                          <td>{teacher.joinDate}</td>
                          <td>
                            <button className="action-btn view">View</button>
                            {teacher.status === 'pending' ? (
                              <>
                                <button 
                                  className="action-btn approve"
                                  onClick={() => handleApproveTeacher(teacher.id)}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="action-btn reject"
                                  onClick={() => handleRejectTeacher(teacher.id)}
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button className="action-btn suspend">Suspend</button>
                            )}
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

        {activeTab === 'approvals' && (
          <div className="tab-content">
            <h2>Teacher Approvals</h2>
            <div className="approvals-list">
              {users.teachers.filter(t => t.status === 'pending').length > 0 ? (
                users.teachers.filter(t => t.status === 'pending').map(teacher => (
                  <div key={teacher.id} className="approval-card">
                    <div className="approval-info">
                      <h4>{teacher.name}</h4>
                      <p>Email: {teacher.email}</p>
                      <p>Department: {teacher.department}</p>
                      <p>Applied: {teacher.joinDate}</p>
                    </div>
                    <div className="approval-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApproveTeacher(teacher.id)}
                      >
                        ✅ Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleRejectTeacher(teacher.id)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No pending approvals</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content">
            <h2>Platform Analytics</h2>
            
            <div className="analytics-cards">
              <div className="analytics-card">
                <h3>Total Students</h3>
                <p className="analytics-number">{analytics.totalStudents}</p>
              </div>
              <div className="analytics-card">
                <h3>Total Teachers</h3>
                <p className="analytics-number">{analytics.totalTeachers}</p>
              </div>
              <div className="analytics-card">
                <h3>Pending Approvals</h3>
                <p className="analytics-number">{analytics.pendingApprovals}</p>
              </div>
              <div className="analytics-card">
                <h3>Active Courses</h3>
                <p className="analytics-number">{analytics.activeCourses}</p>
              </div>
              <div className="analytics-card">
                <h3>Monthly Active Users</h3>
                <p className="analytics-number">{analytics.monthlyActiveUsers}</p>
              </div>
              <div className="analytics-card">
                <h3>Platform Usage</h3>
                <p className="analytics-number">{analytics.platformUsage}%</p>
              </div>
            </div>

            <div className="analytics-chart">
              <h3>Popular Categories</h3>
              <div className="category-list">
                {analytics.popularCategories.map(cat => (
                  <div key={cat.name} className="category-item">
                    <span>{cat.name}</span>
                    <span className="category-count">{cat.count} courses</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="tab-content">
            <h2>Manage Categories</h2>
            
            <div className="add-category">
              <input
                type="text"
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button onClick={handleAddCategory}>Add Category</button>
            </div>

            <div className="categories-list">
              <table>
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Courses</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.courseCount}</td>
                      <td>
                        <span className={`status-badge ${category.status}`}>
                          {category.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`action-btn ${category.status === 'active' ? 'suspend' : 'approve'}`}
                          onClick={() => handleToggleCategory(category.id)}
                        >
                          {category.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="action-btn edit">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="tab-content">
            <h2>Manage Policies</h2>
            
            <div className="add-policy">
              <h3>Add New Policy</h3>
              <input
                type="text"
                placeholder="Policy title"
                value={newPolicy.title}
                onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
              />
              <textarea
                placeholder="Policy content"
                value={newPolicy.content}
                onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
                rows="4"
              />
              <button onClick={handleAddPolicy}>Create Policy</button>
            </div>

            <div className="policies-list">
              <h3>Existing Policies</h3>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Last Updated</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map(policy => (
                    <tr key={policy.id}>
                      <td>{policy.title}</td>
                      <td>{policy.lastUpdated}</td>
                      <td>
                        <span className={`status-badge ${policy.status}`}>
                          {policy.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn edit">Edit</button>
                        <button className="action-btn publish">Publish</button>
                        <button className="action-btn delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;