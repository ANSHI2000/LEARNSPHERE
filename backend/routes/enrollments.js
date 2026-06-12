const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleCheck } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Enroll in course
router.post('/', authMiddleware, roleCheck(['student']), async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID required' });
    }

    // Check if already enrolled
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

    // If free course, enroll directly
    const paymentStatus = course.price === 0 ? 'free' : 'pending';

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: req.user.userId,
        courseId,
        paymentStatus,
      },
    });

    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get enrolled courses for student
router.get('/my-courses', authMiddleware, roleCheck(['student']), async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if enrolled in course
router.get('/check/:courseId', authMiddleware, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { 
        studentId: req.user.userId, 
        courseId
      },
    });

    res.json({ enrolled: !!enrollment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
