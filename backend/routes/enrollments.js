const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const { authMiddleware, roleCheck } = require('../middleware/auth');

const router = express.Router();

// Enroll in course
router.post('/', authMiddleware, roleCheck(['student']), asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ error: 'Course ID required' });
  }

  const existing = await prisma.enrollment.findFirst({
    where: { studentId: req.user.userId, courseId },
  });

  if (existing) {
    return res.status(400).json({ error: 'Already enrolled in this course' });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const paymentStatus = course.price === 0 ? 'free' : 'pending';

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: req.user.userId,
      courseId,
      paymentStatus,
    },
  });

  res.json({ success: true, enrollment });
}));

// Get enrolled courses for student
router.get('/my-courses', authMiddleware, roleCheck(['student']), asyncHandler(async (req, res) => {
  console.log('Fetching enrollments for user:', req.user.userId);
  
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: req.user.userId },
    include: { 
      course: { 
        include: { 
          instructor: { select: { name: true, id: true } },
          lectures: true,
          enrollments: true
        } 
      } 
    },
  });

  console.log('Enrollments found:', enrollments.length);
  res.json(enrollments);
}));

// Check if enrolled in course
router.get('/check/:courseId', authMiddleware, asyncHandler(async (req, res) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: { 
      studentId: req.user.userId, 
      courseId: parseInt(req.params.courseId) 
    },
  });

  res.json({ enrolled: !!enrollment });
}));

module.exports = router;
