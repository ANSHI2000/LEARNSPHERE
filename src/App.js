import React, { useState } from 'react';
import AdminDashboard from './role/AdminDashboard';
import TeacherDashboard from './role/TeacherDashboard';
import StudentDashboard from './role/StudentDashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [message, setMessage] = useState('');

  const fixedCredentials = {
    student: {
      email: 'student@college.edu',
      password: 'student123',
      role: 'Student'
    },
    teacher: {
      email: 'teacher@college.edu',
      password: 'teacher123',
      role: 'Teacher'
    },
    admin: {
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'Administrator'
    }
  };

  const handleRoleSelect = (role) => {
    setUserType(role);
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const credentials = fixedCredentials[userType];
    
    if (formData.email === credentials.email && formData.password === credentials.password) {
      setMessage(`✅ Login successful! Welcome ${credentials.role}.`);
      
      setIsAuthenticated(true);
      setAuthenticatedUser({
        type: userType,
        role: credentials.role,
        email: credentials.email
      });

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', userType);
      localStorage.setItem('userRole', credentials.role);
      localStorage.setItem('userEmail', credentials.email);
      
    } else {
      setMessage(`❌ Invalid credentials for ${credentials.role}. Please try again.`);
    }
  };

  const fillDemoCredentials = () => {
    const credentials = fixedCredentials[userType];
    setFormData({
      ...formData,
      email: credentials.email,
      password: credentials.password
    });
  };

  React.useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setAuthenticatedUser({
        type: localStorage.getItem('userType'),
        role: localStorage.getItem('userRole'),
        email: localStorage.getItem('userEmail')
      });
    }
  }, []);

if (isAuthenticated && authenticatedUser?.type === 'admin') {
  return <AdminDashboard />;
}

if (isAuthenticated && authenticatedUser?.type === 'teacher') {
  return <TeacherDashboard />;
}

if (isAuthenticated && authenticatedUser?.type === 'student') {
  return <StudentDashboard />;
}

if (isAuthenticated && authenticatedUser?.type === 'student') {
  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>
      <p>Welcome, {authenticatedUser?.email}!</p>
      <button 
        onClick={() => {
          localStorage.clear();
          setIsAuthenticated(false);
          setAuthenticatedUser(null);
        }}
        className="logout-btn"
      >
        Logout
      </button>
    </div>
  );
}

  if (isAuthenticated) {
    return (
      <div className="dashboard-container">
        <h1>{authenticatedUser?.role} Dashboard</h1>
        <p>Welcome, {authenticatedUser?.email}!</p>
        <button 
          onClick={() => {
            localStorage.clear();
            setIsAuthenticated(false);
            setAuthenticatedUser(null);
          }}
          className="logout-btn"
        >
          Logout
        </button>
      </div>
    );
  }

  const getRoleColor = (role) => {
    switch(role) {
      case 'student': return '#667eea';
      case 'teacher': return '#38a169';
      case 'admin': return '#e53e3e';
      default: return '#667eea';
    }
  };

  return (
    <div className="App">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Welcome Back</h1>
          
          
          <div className="role-selector">
            <button
              className={`role-btn ${userType === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('student')}
              style={{ borderColor: userType === 'student' ? '#667eea' : '#e1e1e1' }}
            >
              <span className="role-icon">👨‍🎓</span>
              Student
            </button>
            <button
              className={`role-btn ${userType === 'teacher' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('teacher')}
              style={{ borderColor: userType === 'teacher' ? '#38a169' : '#e1e1e1' }}
            >
              <span className="role-icon">👨‍🏫</span>
              Teacher
            </button>
            <button
              className={`role-btn ${userType === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('admin')}
              style={{ borderColor: userType === 'admin' ? '#e53e3e' : '#e1e1e1' }}
            >
              <span className="role-icon">👨‍💼</span>
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="forgot-password" onClick={(e) => e.preventDefault()}>
                Forgot Password?
              </a>
            </div>

            {message && (
              <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              style={{ 
                background: userType === 'student' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : userType === 'teacher'
                  ? 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)'
                  : 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'
              }}
            >
              Login as {fixedCredentials[userType].role}
            </button>
          </form>

          <div className="signup-link">
            Don't have an account? <a href="/signup" onClick={(e) => e.preventDefault()}>Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;