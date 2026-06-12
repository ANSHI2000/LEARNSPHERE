const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const { verifyCourseOwnership } = require('../middleware/courseOwnership');

const router = express.Router();

// Add lecture to course
router.post('/', authMiddleware, roleCheck(['instructor', 'admin']), asyncHandler(async (req, res) => {
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

  const authorized = await verifyCourseOwnership(req, res, courseId);
  if (!authorized) return;

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
}));

// Get lectures for course
router.get('/course/:courseId', asyncHandler(async (req, res) => {
  const lectures = await prisma.lecture.findMany({
    where: { courseId: parseInt(req.params.courseId) },
    orderBy: { orderIdx: 'asc' },
  });

  res.json(lectures);
}));

// Get single lecture
router.get('/:id', asyncHandler(async (req, res) => {
  const lecture = await prisma.lecture.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!lecture) {
    return res.status(404).json({ error: 'Lecture not found' });
  }

  res.json(lecture);
}));

module.exports = router;
