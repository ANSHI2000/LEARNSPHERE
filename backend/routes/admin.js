const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleCheck } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Dashboard stats (Admin only)
router.get('/stats', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
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
      completionRate: totalEnrollments > 0 ? ((completedEnrollments / totalEnrollments) * 100).toFixed(2) : '0.00',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (Admin only)
router.get('/users', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all courses (Admin only)
router.get('/courses', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { 
        instructor: { select: { name: true } },
        enrollments: { select: { id: true } }
      },
    });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: Enrollment Trends (Last 30 days)
router.get('/analytics/enrollment-trends', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enrollments = await prisma.enrollment.findMany({
      where: { enrolledAt: { gte: thirtyDaysAgo } },
      select: { enrolledAt: true }
    });

    // Group by date
    const trendsMap = {};
    enrollments.forEach(e => {
      const date = e.enrolledAt.toISOString().split('T')[0];
      trendsMap[date] = (trendsMap[date] || 0) + 1;
    });

    const trends = Object.entries(trendsMap)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => ({ date, enrollments: count }));

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: Course Performance
router.get('/analytics/course-performance', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: User Growth (Last 30 days)
router.get('/analytics/user-growth', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, role: true }
    });

    // Group by date and role
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: Payment Statistics
router.get('/analytics/payment-stats', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
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
          // Paid course enrollment
          stats.totalRevenue += course.price;
          if (e.paymentStatus === 'completed') {
            stats.completedPayments++;
            stats.paymentBreakdown.completed++;
          } else {
            stats.pendingPayments++;
            stats.paymentBreakdown.pending++;
          }
        } else {
          // Free course enrollment
          stats.freeEnrollments++;
          stats.paymentBreakdown.free++;
        }
      });
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: Course Category Distribution
router.get('/analytics/category-distribution', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: Instructor Performance
router.get('/analytics/instructor-performance', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
