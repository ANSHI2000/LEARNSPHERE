const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const { authMiddleware, roleCheck } = require('../middleware/auth');

const router = express.Router();

// Create course (Instructor only)
router.post('/', authMiddleware, roleCheck(['instructor', 'admin']), asyncHandler(async (req, res) => {
  const { title, description, price, category, level, weeks } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category required' });
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      price: price || 0,
      category,
      level: level || 'beginner',
      weeks: weeks || 4,
      instructorId: req.user.userId,
      published: true,
    },
    include: { 
      instructor: { select: { name: true, id: true } },
      lectures: true,
      enrollments: true
    }
  });

  res.json({ success: true, course });
}));

// Get all courses (published, visible to students)
router.get('/', asyncHandler(async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: { 
      instructor: { select: { name: true, id: true } },
      lectures: { select: { id: true, title: true, week: true, hasQuiz: true }, orderBy: { orderIdx: 'asc' } },
      enrollments: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(courses);
}));

// Get instructor's courses (MUST come before /:id route for proper routing)
router.get('/instructor/my-courses', authMiddleware, roleCheck(['instructor']), asyncHandler(async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { instructorId: req.user.userId },
    include: { 
      lectures: { orderBy: { orderIdx: 'asc' } },
      enrollments: { include: { student: { select: { name: true, email: true } } } }
    },
  });

  res.json(courses);
}));

// Get single course by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      instructor: { select: { name: true, id: true } },
      lectures: { orderBy: { orderIdx: 'asc' } },
    },
  });

  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  res.json(course);
}));

// Publish course (Instructor only)
router.post('/:id/publish', authMiddleware, roleCheck(['instructor', 'admin']), asyncHandler(async (req, res) => {
  const course = await prisma.course.update({
    where: { id: parseInt(req.params.id) },
    data: { published: true },
  });

  res.json({ success: true, course });
}));

// Delete course (Instructor only - must own the course)
router.delete('/:id', authMiddleware, roleCheck(['instructor', 'admin']), asyncHandler(async (req, res) => {
  const courseId = parseInt(req.params.id);
  
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });

  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  if (course.instructorId !== req.user.userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this course' });
  }

  await prisma.quizQuestion.deleteMany({
    where: { quiz: { courseId: courseId } }
  });

  await prisma.quiz.deleteMany({
    where: { courseId: courseId }
  });

  await prisma.enrollment.deleteMany({
    where: { courseId: courseId }
  });

  await prisma.progress.deleteMany({
    where: { lecture: { courseId: courseId } }
  });

  await prisma.lecture.deleteMany({
    where: { courseId: courseId }
  });

  const deletedCourse = await prisma.course.delete({
    where: { id: courseId }
  });

  res.json({ success: true, message: 'Course deleted successfully', course: deletedCourse });
}));

module.exports = router;
