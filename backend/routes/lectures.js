const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleCheck } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Add lecture to course
router.post('/', authMiddleware, roleCheck(['instructor', 'admin']), async (req, res) => {
  try {
    const { 
      title, 
      description,
      videoUrl, 
      theory,
      duration, 
      week,
      hasQuiz,
      courseId 
    } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ error: 'Title and courseId required' });
    }

    // Verify instructor owns course
    const course = await prisma.course.findUnique({ 
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get next orderIdx
    const maxLecture = await prisma.lecture.findFirst({
      where: { courseId },
      orderBy: { orderIdx: 'desc' },
      select: { orderIdx: true }
    });

    const nextOrderIdx = (maxLecture?.orderIdx || 0) + 1;

    const lecture = await prisma.lecture.create({
      data: {
        title,
        description,
        videoUrl,
        theory,
        duration: duration || 0,
        week: week || 1,
        hasQuiz: hasQuiz || false,
        courseId,
        orderIdx: nextOrderIdx,
      },
    });

    res.json({ success: true, lecture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lectures for course
router.get('/course/:courseId', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const lectures = await prisma.lecture.findMany({
      where: { courseId },
      orderBy: { orderIdx: 'asc' },
    });

    res.json(lectures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single lecture
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid lecture ID' });
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id },
    });

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    res.json(lecture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
