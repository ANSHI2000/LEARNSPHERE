const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleCheck } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create course (Instructor only)
router.post('/', authMiddleware, roleCheck(['instructor', 'admin']), async (req, res) => {
  try {
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
        published: true, // Auto-publish when created
      },
      include: { 
        instructor: { select: { name: true, id: true } },
        lectures: true,
        enrollments: true
      }
    });

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all courses (published, visible to students)
router.get('/', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get instructor's courses (MUST come before /:id route for proper routing)
router.get('/instructor/my-courses', authMiddleware, roleCheck(['instructor']), async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.userId },
      include: { 
        lectures: { orderBy: { orderIdx: 'asc' } },
        enrollments: { include: { student: { select: { name: true, email: true } } } }
      },
    });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { name: true, id: true } },
        lectures: { orderBy: { orderIdx: 'asc' } },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish course (Instructor only)
router.post('/:id/publish', authMiddleware, roleCheck(['instructor', 'admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const course = await prisma.course.update({
      where: { id },
      data: { published: true },
    });

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course (Instructor only - must own the course)
router.delete('/:id', authMiddleware, roleCheck(['instructor', 'admin']), async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    // Check if course exists and belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    // Delete related quiz questions
    await prisma.quizQuestion.deleteMany({
      where: { quiz: { courseId: courseId } }
    });

    // Delete related quizzes
    await prisma.quiz.deleteMany({
      where: { courseId: courseId }
    });

    // Delete related enrollments
    await prisma.enrollment.deleteMany({
      where: { courseId: courseId }
    });

    // Delete related progress records
    await prisma.progress.deleteMany({
      where: { lecture: { courseId: courseId } }
    });

    // Delete related lectures
    await prisma.lecture.deleteMany({
      where: { courseId: courseId }
    });

    // Finally delete the course
    const deletedCourse = await prisma.course.delete({
      where: { id: courseId }
    });

    res.json({ success: true, message: 'Course deleted successfully', course: deletedCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
