// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Fetch wrapper with auth
const callAPI = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const error = new Error(`Server returned non-JSON response (HTTP ${response.status})`);
      error.response = {
        status: response.status,
        data: { error: `Unexpected response format (HTTP ${response.status})` },
      };
      throw error;
    }

    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = new Error('API Error');
      error.response = {
        status: response.status,
        data: data,
      };
      throw error;
    }

    return { data, status: response.status };
  } catch (error) {
    if (error.response) {
      throw error;
    }
    const networkError = new Error(error.message || 'Network error');
    networkError.response = {
      status: 0,
      data: { error: error.message },
    };
    throw networkError;
  }
};

// Auth endpoints
export const authAPI = {
  register: async (email, name, password, role = 'student') => {
    const result = await callAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password, role }),
    });
    return { data: result.data };
  },

  login: async (email, password) => {
    const result = await callAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { data: result.data };
  },
};

// Course endpoints
export const courseAPI = {
  getAll: async () => {
    const result = await callAPI('/courses');
    return { data: result.data };
  },

  getById: async (id) => {
    const result = await callAPI(`/courses/${id}`);
    return { data: result.data };
  },

  create: async (data) => {
    const result = await callAPI('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: result.data };
  },

  publish: async (id) => {
    const result = await callAPI(`/courses/${id}/publish`, {
      method: 'POST',
    });
    return { data: result.data };
  },

  getInstructorCourses: async () => {
    const result = await callAPI('/courses/instructor/my-courses');
    return { data: result.data };
  },

  delete: async (id) => {
    const result = await callAPI(`/courses/${id}`, {
      method: 'DELETE',
    });
    return { data: result.data };
  },
};

// Lecture endpoints
export const lectureAPI = {
  create: async (data) => {
    const result = await callAPI('/lectures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: result.data };
  },

  getByCourse: async (courseId) => {
    const result = await callAPI(`/lectures/course/${courseId}`);
    return { data: result.data };
  },

  getById: async (id) => {
    const result = await callAPI(`/lectures/${id}`);
    return { data: result.data };
  },
};

// Enrollment endpoints
export const enrollmentAPI = {
  enroll: async (courseId) => {
    const result = await callAPI('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
    return { data: result.data };
  },

  getMyCourses: async () => {
    const result = await callAPI('/enrollments/my-courses');
    return { data: result.data };
  },

  checkEnrollment: async (courseId) => {
    const result = await callAPI(`/enrollments/check/${courseId}`);
    return { data: result.data };
  },
};

// Progress endpoints
export const progressAPI = {
  update: async (lectureId, lastTimestamp, completed) => {
    const result = await callAPI('/progress', {
      method: 'POST',
      body: JSON.stringify({ lectureId, lastTimestamp, completed }),
    });
    return { data: result.data };
  },

  getCourseProgress: async (courseId) => {
    const result = await callAPI(`/progress/course/${courseId}`);
    return { data: result.data };
  },

  getResume: async (courseId) => {
    const result = await callAPI(`/progress/course/${courseId}/resume`);
    return { data: result.data };
  },
};

// Quiz endpoints
export const quizAPI = {
  create: async (data) => {
    const result = await callAPI('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: result.data };
  },

  addQuestion: async (quizId, data) => {
    const result = await callAPI(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: result.data };
  },

  submitAttempt: async (quizId, answers) => {
    const result = await callAPI('/quizzes/attempt', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers }),
    });
    return { data: result.data };
  },

  getById: async (id) => {
    const result = await callAPI(`/quizzes/${id}`);
    return { data: result.data };
  },

  getByCourse: async (courseId) => {
    const result = await callAPI(`/quizzes/course/${courseId}`);
    return { data: result.data };
  },

  getStudentAttempts: async () => {
    const result = await callAPI('/quizzes/student/attempts');
    return { data: result.data };
  },
};

// Admin endpoints
export const adminAPI = {
  getStats: async () => {
    const result = await callAPI('/admin/stats');
    return { data: result.data };
  },

  getAllUsers: async () => {
    const result = await callAPI('/admin/users');
    return { data: result.data };
  },

  getAllCourses: async () => {
    const result = await callAPI('/admin/courses');
    return { data: result.data };
  },

  // Analytics endpoints
  getEnrollmentTrends: async () => {
    const result = await callAPI('/admin/analytics/enrollment-trends');
    return { data: result.data };
  },

  getCoursePerformance: async () => {
    const result = await callAPI('/admin/analytics/course-performance');
    return { data: result.data };
  },

  getUserGrowth: async () => {
    const result = await callAPI('/admin/analytics/user-growth');
    return { data: result.data };
  },

  getPaymentStats: async () => {
    const result = await callAPI('/admin/analytics/payment-stats');
    return { data: result.data };
  },

  getCategoryDistribution: async () => {
    const result = await callAPI('/admin/analytics/category-distribution');
    return { data: result.data };
  },

  getInstructorPerformance: async () => {
    const result = await callAPI('/admin/analytics/instructor-performance');
    return { data: result.data };
  },
};

// Payment endpoints (Razorpay)
export const paymentAPI = {
  createOrder: async (data) => {
    const result = await callAPI('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: result.data };
  },

  verifyPayment: async (data) => {
    const result = await callAPI('/payments/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: result.data };
  },

  getStatus: async (enrollmentId) => {
    const result = await callAPI(`/payments/status/${enrollmentId}`);
    return { data: result.data };
  },
};

// Messaging endpoints
export const messageAPI = {
  send: async (senderId, receiverId, subject, content) => {
    const result = await callAPI('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ senderId, receiverId, subject, content }),
    });
    return { data: result.data };
  },

  getInbox: async (userId) => {
    const result = await callAPI(`/messages/inbox/${userId}`);
    return { data: result.data };
  },

  getSent: async (userId) => {
    const result = await callAPI(`/messages/sent/${userId}`);
    return { data: result.data };
  },

  getConversation: async (userId1, userId2) => {
    const result = await callAPI(`/messages/conversation/${userId1}/${userId2}`);
    return { data: result.data };
  },

  markAsRead: async (messageId) => {
    const result = await callAPI(`/messages/mark-read/${messageId}`, {
      method: 'PATCH',
    });
    return { data: result.data };
  },

  getInstructors: async (studentId) => {
    const result = await callAPI(`/messages/instructors/${studentId}`);
    return { data: result.data };
  },

  delete: async (messageId) => {
    const result = await callAPI(`/messages/${messageId}`, {
      method: 'DELETE',
    });
    return { data: result.data };
  },
};
