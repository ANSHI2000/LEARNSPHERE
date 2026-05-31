const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleCheck } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Update progress
router.post('/', authMiddleware, roleCheck(['student']), async (req, res) => {
  try {
    const { lectureId, lastTimestamp, completed } = req.body;

    if (!lectureId) {
      return res.status(400).json({ error: 'Lecture ID required' });
    }

    const progress = await prisma.progress.upsert({
      where: {
        studentId_lectureId: {
          studentId: req.user.userId,
          lectureId,
        },
      },
      update: { lastTimestamp: lastTimestamp || 0, completed: completed || false },
      create: {
        studentId: req.user.userId,
        lectureId,
        lastTimestamp: lastTimestamp || 0,
        completed: completed || false,
      },
    });

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get progress for course
router.get('/course/:courseId', authMiddleware, roleCheck(['student']), async (req, res) => {
  try {
    const lectures = await prisma.lecture.findMany({
      where: { courseId: parseInt(req.params.courseId) },
      select: { id: true },
    });

    const progress = await prisma.progress.findMany({
      where: {
        studentId: req.user.userId,
        lectureId: { in: lectures.map(l => l.id) },
      },
    });

    // Calculate completion percentage
    const completed = progress.filter(p => p.completed).length;
    const percentage = lectures.length > 0 ? (completed / lectures.length) * 100 : 0;

    res.json({ progress, completionPercentage: Math.round(percentage) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get last watched lecture (for resume feature)
router.get('/course/:courseId/resume', authMiddleware, roleCheck(['student']), async (req, res) => {
  try {
    const lectures = await prisma.lecture.findMany({
      where: { courseId: parseInt(req.params.courseId) },
      orderBy: { orderIdx: 'asc' },
      select: { id: true, orderIdx: true },
    });

    if (lectures.length === 0) {
      return res.status(404).json({ error: 'No lectures found' });
    }

    const lastProgress = await prisma.progress.findFirst({
      where: {
        studentId: req.user.userId,
        lectureId: { in: lectures.map(l => l.id) },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const resumeLectureId = lastProgress?.lectureId || lectures[0]?.id;
    const resumeTimestamp = lastProgress?.lastTimestamp || 0;

    res.json({
      lectureId: resumeLectureId,
      timestamp: resumeTimestamp,
      allLectures: lectures,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
