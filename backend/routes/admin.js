const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const { authMiddleware, roleCheck } = require('../middleware/auth');

const router = express.Router();

// Dashboard stats (Admin only)
router.get('/stats', authMiddleware, roleCheck(['admin']), asyncHandler(async (req, res) => {
  const totalUsers = await prisma.user.count();
  const totalCourses = await prisma.course.count();
  const totalEnrollments = await prisma.enrollment.count();
  const instructors = await prisma.user.count({ where: { role: 'instructor' } });
  const students = await prisma.user.count({ where: { role: 'student' } });

  const completedEnrollments = await prisma.enrollment.count({
    where: { paymentStatus: 'completed' },
  });

  res.json({
    totalUsers,
    totalCourses,
    totalEnrollments,
    instructors,
    students,
    completedEnrollments,
    completionRate: ((completedEnrollments / totalEnrollments) * 100).toFixed(2) || 0,
  });
}));

// Get all users (Admin only)
router.get('/users', authMiddleware, roleCheck(['admin']), asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true, 
      createdAt: true 
    },
  });

  res.json(users);
}));

// Get all courses (Admin only)
router.get('/courses', authMiddleware, roleCheck(['admin']), asyncHandler(async (req, res) => {
  const courses = await prisma.course.findMany({
    include: { 
      instructor: { select: { name: true } },
      enrollments: { select: { id: true } }
    },
  });

  res.json(courses);
}));

// Analytics: Enrollment Trends (Last 30 days)
router.get('/analytics/enrollment-trends', authMiddleware, roleCheck(['admin']), asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const enrollments = await prisma.enrollment.findMany({
    where: { enrolledAt: { gte: thirtyDaysAgo } },
    select: { enrolledAt: true }
  });

  const trendsMap = {};
  enrollments.forEach(e => {
    const date = e.enrolledAt.toISOString().split('T')[0];
    trendsMap[date] = (trendsMap[date] || 0) + 1;
  });

  const trends = Object.entries(trendsMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, count]) => ({ date, enrollments: count }));

  res.json(trends);
}));

// Analytics: Course Performance
router.get('/analytics/course-performance', authMiddleware, roleCheck(['admin']), asyncHandler(async (req, res) => {
  const courses = await prisma.course.findMany({
    include: {
      instructor: { select: { name: true } },
      enrollments: {
        select: { id: true, paymentStatus: true }
      },
      _count: {
        select: { enrollments: true }
      }
    },
    take: 10,
    orderBy: { enrollments: { _count: 'desc' } }
  });

  const performance = courses.map(course => ({
    id: course.id,
    title: course.title,
    instructor: course.instructor.name,
    enrollments: course.enrollments.length,
    revenue: (course.price || 0) * course.enrollments.length
  }));

  res.json(performance);
}));

// Analytics: User Growth (Last 30 days)
router.get('/analytics/user-growth', authMiddleware, roleCheck(['admin']), asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, role: true }
  });

  const growthMap = {};
  users.forEach(u => {
    const date = u.createdAt.toISOString().split('T')[0];
    if (!growthMap[date]) growthMap[date] = { students: 0, instructors: 0 };
    if (u.role === 'student') growthMap[date].students++;
    else if (u.role === 'instructor') growthMap[date].instructors++;
  });

  const growth = Object.entries(growthMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, counts]) => ({ date, ...counts }));

  res.json(growth);
}));

// Analytics: Payment Statistics
router.get('/analytics/payment-stats', authMiddleware, roleCheck(['admin']), asyncHandler(async (req, res) => {
  const courses = await prisma.course.findMany({
    include: { enrollments: true }
  });

  const stats = {
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    freeEnrollments: 0,
    paymentBreakdown: {
      completed: 0,
      pending: 0,
      free: 0
    }
  };

  courses.forEach(course => {
    course.enrollments.forEach(e => {
      if (course.price > 0) {
        stats.totalRevenue += course.price;
        if (e.paymentStatus === 'completed') {
          stats.completedPayments++;
          stats.paymentBreakdown.completed++;
        } else {
          stats.pendingPayments++;
          stats.paymentBreakdown.pending++;
        }
      } else {
        stats.freeEnrollments++;
        stats.paymentBreakdown.free++;
      }
    });
  });

  res.json(stats);
}));

// Analytics: Course Category Distribution
router.get('/analytics/category-distribution', authMiddleware, roleCheck(['admin']), asyncHandler(async (req, res) => {
  const courses = await prisma.course.findMany({
    select: { 
      category: true, 
      id: true,
      enrollments: { select: { id: true } }
    }
  });

  const categoryMap = {};
  courses.forEach(course => {
    if (!categoryMap[course.category]) {
      categoryMap[course.category] = { courses: 0, enrollments: 0 };
    }
    categoryMap[course.category].courses++;
    categoryMap[course.category].enrollments += course.enrollments.length;
  });

  const distribution = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    ...data
  }));

  res.json(distribution);
}));

// Analytics: Instructor Performance
router.get('/analytics/instructor-performance', authMiddleware, roleCheck(['admin']), asyncHandler(async (req, res) => {
  const instructors = await prisma.user.findMany({
    where: { role: 'instructor' },
    include: {
      coursesCreated: {
        include: {
          enrollments: { select: { id: true, paymentStatus: true } }
        }
      }
    }
  });

  const performance = instructors.map(instructor => ({
    id: instructor.id,
    name: instructor.name,
    courses: instructor.coursesCreated.length,
    totalEnrollments: instructor.coursesCreated.reduce((sum, c) => sum + c.enrollments.length, 0),
    revenue: instructor.coursesCreated.reduce((sum, course) => {
      const courseRevenue = (course.price || 0) * course.enrollments.length;
      return sum + courseRevenue;
    }, 0)
  }));

  res.json(performance);
}));

module.exports = router;
