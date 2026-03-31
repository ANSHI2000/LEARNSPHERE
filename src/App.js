import React, { useState, useEffect } from 'react'
import { authService } from './services/auth'
import AdminDashboard from './role/AdminDashboard'
import TeacherDashboard from './role/TeacherDashboard'
import StudentDashboard from './role/StudentDashboard'
import SignUp from './role/SignUp'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authenticatedUser, setAuthenticatedUser] = useState(null)
  const [userType, setUserType] = useState('student')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSignUp, setShowSignUp] = useState(false)

  // Check for existing session on load
  useEffect(() => {
    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkSession = async () => {
    const { data, error } = await authService.getSession()
    if (error) {
      console.error('Session check error:', error)
    }
    if (data?.session) {
      setIsAuthenticated(true)
      setAuthenticatedUser({
        type: data.profile.role,
        role: data.profile.role,
        email: data.profile.email,
        profile: data.profile
      })
    }
    setLoading(false)
  }

  const handleRoleSelect = (role) => {
    setUserType(role)
    setMessage('')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await authService.signIn(
      formData.email,
      formData.password
    )

    if (error) {
      setMessage(`❌ Login failed: ${error.message}`)
      setLoading(false)
      return
    }

    if (data && data.profile.role === userType) {
      setMessage(`✅ Login successful! Welcome ${data.profile.full_name}.`)
      setIsAuthenticated(true)
      setAuthenticatedUser({
        type: data.profile.role,
        role: data.profile.role,
        email: data.profile.email,
        profile: data.profile
      })
    } else if (data && data.profile.role !== userType) {
      setMessage(`❌ This account is registered as ${data.profile.role}, not ${userType}. Please select the correct role.`)
      setLoading(false)
      return
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await authService.signOut()
    localStorage.clear()
    setIsAuthenticated(false)
    setAuthenticatedUser(null)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // If authenticated, show appropriate dashboard
  if (isAuthenticated && authenticatedUser) {
    switch (authenticatedUser.type) {
      case 'admin':
        return <AdminDashboard onLogout={handleLogout} user={authenticatedUser} />
      case 'teacher':
        return <TeacherDashboard onLogout={handleLogout} user={authenticatedUser} />
      case 'student':
        return <StudentDashboard onLogout={handleLogout} user={authenticatedUser} />
      default:
        return <div>Unknown user role</div>
    }
  }

  // Show Sign Up page
  if (showSignUp) {
    return <SignUp onSwitchToLogin={() => setShowSignUp(false)} />
  }

  // Login page
  return (
    <div className="App">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Welcome Back</h1>
          
          {/* Role Selection Buttons */}
          <div className="role-selector">
            <button
              className={`role-btn ${userType === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('student')}
            >
              <span className="role-icon">👨‍🎓</span>
              Student
            </button>
            <button
              className={`role-btn ${userType === 'teacher' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('teacher')}
            >
              <span className="role-icon">👨‍🏫</span>
              Teacher
            </button>
            <button
              className={`role-btn ${userType === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('admin')}
            >
              <span className="role-icon">👨‍💼</span>
              Admin
            </button>
          </div>

          {/* Login Form */}
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
              <button className="forgot-password" onClick={(e) => e.preventDefault()}>
                Forgot Password?
              </button>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : `Login as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
            </button>
          </form>

          <div className="signup-link">
            Don't have an account?{' '}
            <button className="link-button" onClick={() => setShowSignUp(true)}>
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App