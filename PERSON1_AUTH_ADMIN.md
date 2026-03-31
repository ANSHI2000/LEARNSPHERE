# Person 1: Authentication & Admin Module 🔒

## 📋 Overview
You'll be responsible for user authentication, authorization, and admin dashboard features.

---

## 📁 Files You'll Work With

### Backend Services
- `src/services/auth.js` - Authentication logic (login, signup, password reset)
- `src/services/admin.js` - Admin operations
- `src/services/supabase.js` - Database connection setup

### Frontend Components
- `src/role/SignUp.js` - User registration UI
- `src/role/AdminDashboard.js` - Admin control panel
- `src/App.js` - Route protection & auth flow

### Styling
- `src/role/SignUp.css` - SignUp page styling
- `src/role/AdminDashboard.css` - Admin dashboard styling

---

## 🎯 Key Features to Implement

### 1. User Authentication
- [ ] **Sign Up** - Register new users (student/teacher/admin)
- [ ] **Login** - Email & password authentication
- [ ] **Password Reset** - Forgot password flow
- [ ] **Email Verification** - Verify user email
- [ ] **Session Management** - Keep users logged in

### 2. Authorization & Roles
- [ ] **Role-based Access** - Distinguish between admin, teacher, student
- [ ] **Protected Routes** - Only logged-in users can access dashboards
- [ ] **Permission Checks** - Only admins can access admin panel

### 3. Admin Dashboard
- [ ] **User Management** - View all users, edit roles, delete users
- [ ] **System Stats** - Total users, courses, quizzes, enrollments
- [ ] **Approve Teachers** - Review & approve new teacher registrations
- [ ] **Manage Roles** - Assign/change user roles
- [ ] **View Logs** - System activity logs

---

## 📚 Technologies to Learn

### Frontend
```javascript
- React Hooks (useState, useEffect, useContext)
- React Router (navigation & route protection)
- Local Storage & Session Storage
- React Context API (state management)
```

### Backend (Supabase)
```javascript
- Supabase Authentication (@supabase/supabase-js)
- PostgreSQL database queries
- JWT tokens
- User metadata storage
```

### Security
- Password hashing & validation
- CORS setup
- Environment variables (.env)
- JWT verification

---

## 🔗 Dependencies

### npm packages to use
```json
{
  "@supabase/supabase-js": "^2.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x"
}
```

---

## 📝 Learning Path

1. **Week 1**: Learn Supabase auth setup
2. **Week 2**: Implement signup & login
3. **Week 3**: Add password reset & email verification
4. **Week 4**: Build admin dashboard UI
5. **Week 5**: Implement admin functions (user management)
6. **Week 6**: Add route protection & permissions
7. **Week 7**: Testing & bug fixes

---

## 📞 Key Functions to Create

```javascript
// auth.js
- signUp(email, password, userType)
- login(email, password)
- logout()
- getCurrentUser()
- resetPassword(email)
- getAllUsers() // for admin
- updateUserRole(userId, newRole) // admin only
- deleteUser(userId) // admin only

// Admin Dashboard
- displayUserStats()
- manageUserRoles()
- approveTeachers()
- viewSystemLogs()
```

---

## 🧪 Testing Checklist

- [ ] Signup form validation works
- [ ] Login authenticates correctly
- [ ] Logout clears session
- [ ] Password reset email sent
- [ ] Admin can view all users
- [ ] Admin can change user roles
- [ ] Non-admins can't access admin panel
- [ ] Routes are protected
- [ ] Session persists on page reload

---

## 🚀 Getting Started

1. Clone the repo: `git clone https://github.com/ANSHI2000/LEARNSPHERE.git`
2. Create your branch: `git checkout -b feature/auth-admin`
3. Install dependencies: `npm install` (from learnsphere folder)
4. Start: `npm start`
5. Read Supabase docs: https://supabase.com/docs

**Need help?** Check `src/services/supabase.js` for database connection setup.
