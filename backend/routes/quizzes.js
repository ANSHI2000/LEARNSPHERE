const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleCheck } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create quiz (Instructor)
router.post('/', authMiddleware, roleCheck(['instructor', 'admin']), async (req, res) => {
  try {
    const { title, courseId } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ error: 'Title and course ID required' });
    }

    // Verify instructor owns course
    const course = await prisma.course.findUnique({ 
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (course.instructorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const quiz = await prisma.quiz.create({
      data: { title, courseId },
    });

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add question to quiz
router.post('/:quizId/questions', authMiddleware, roleCheck(['instructor', 'admin']), async (req, res) => {
  try {
    const { question, options, correctAnswer } = req.body;

    if (!question || !options || correctAnswer === undefined) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        question,
        options: JSON.stringify(options),
        correctAnswer: String(correctAnswer), // Convert to string
        quizId: parseInt(req.params.quizId),
      },
    });

    res.json({ success: true, quizQuestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz attempt
router.post('/attempt', authMiddleware, roleCheck(['student']), async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers = { questionId: userAnswer }

    if (!quizId || !answers) {
      return res.status(400).json({ error: 'Quiz ID and answers required' });
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { quizId },
    });

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: req.user.userId,
        score: percentage,
      },
    });

    res.json({ success: true, score: Math.round(percentage), attempt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quizzes for a course
router.get('/course/:courseId', authMiddleware, async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: parseInt(req.params.courseId) },
      include: {
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz attempts for student
router.get('/student/attempts', authMiddleware, roleCheck(['student']), async (req, res) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { studentId: req.user.userId },
      include: { quiz: true },
    });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz details
router.get('/:quizId', async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(req.params.quizId) },
      include: { questions: true },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
