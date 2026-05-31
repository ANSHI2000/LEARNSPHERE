import React, { useState } from 'react'
import { authService } from '../services/auth'
import './SignUp.css'

const SignUp = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    agreeToTerms: false
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Validation rules
  const validateForm = () => {
    const newErrors = {}

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter'
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number'
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submitted')
    
    if (!validateForm()) {
      console.log('Validation failed')
      return
    }

    console.log('Validation passed, attempting sign up...')
    setLoading(true)
    
    const { data, error } = await authService.signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.role
    )

    console.log('Sign up response:', { data, error })

    setLoading(false)

    if (error) {
      console.error('Sign up error:', error)
      setErrors({
        submit: error.message || 'Failed to create account. Please try again.'
      })
    } else {
      console.log('Sign up successful!')
      setSuccess(true)
      // Auto redirect after 3 seconds
      setTimeout(() => {
        onSwitchToLogin()
      }, 3000)
    }
  }

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-card success-card">
          <div className="success-icon">✓</div>
          <h2>Registration Successful!</h2>
          <p>Your account has been created successfully.</p>
          {formData.role === 'teacher' && (
            <p className="info-text">
              Note: Teacher accounts require admin approval before you can create courses.
              You'll receive an email once your account is approved.
            </p>
          )}
          <p>Redirecting to login page...</p>
          <button onClick={onSwitchToLogin} className="login-link-btn">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join LearnSphere to start your learning journey</p>
        </div>

        {errors.submit && (
          <div className="error-alert">
            <strong>Error:</strong> {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
            <div className="password-hint">
              Password must contain at least 6 characters, one uppercase letter, and one number
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label>
              I want to join as <span className="required">*</span>
            </label>
            <div className="role-options">
              <label className={`role-option ${formData.role === 'student' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                />
                <div className="role-card">
                  <span className="role-icon">👨‍🎓</span>
                  <div className="role-info">
                    <strong>Student</strong>
                    <small>Access courses and start learning</small>
                  </div>
                </div>
              </label>

              <label className={`role-option ${formData.role === 'teacher' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={formData.role === 'teacher'}
                  onChange={handleChange}
                />
                <div className="role-card">
                  <span className="role-icon">👨‍🏫</span>
                  <div className="role-info">
                    <strong>Teacher</strong>
                    <small>Create and manage courses</small>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <span>
                I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and 
                <a href="#" onClick={(e) => e.preventDefault()}> Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="signup-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Link */}
          <div className="login-link">
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="link-btn">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp