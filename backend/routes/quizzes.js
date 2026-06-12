const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const { verifyCourseOwnership } = require('../middleware/courseOwnership');

const router = express.Router();

// Create quiz (Instructor)
router.post('/', authMiddleware, roleCheck(['instructor', 'admin']), asyncHandler(async (req, res) => {
  const { title, courseId } = req.body;

  if (!title || !courseId) {
    return res.status(400).json({ error: 'Title and course ID required' });
  }

  const authorized = await verifyCourseOwnership(req, res, courseId);
  if (!authorized) return;

  const quiz = await prisma.quiz.create({
    data: { title, courseId },
  });

  res.json({ success: true, quiz });
}));

// Add question to quiz
router.post('/:quizId/questions', authMiddleware, roleCheck(['instructor', 'admin']), asyncHandler(async (req, res) => {
  const { question, options, correctAnswer } = req.body;

  if (!question || !options || correctAnswer === undefined) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const quizQuestion = await prisma.quizQuestion.create({
    data: {
      question,
      options: JSON.stringify(options),
      correctAnswer: String(correctAnswer),
      quizId: parseInt(req.params.quizId),
    },
  });

  res.json({ success: true, quizQuestion });
}));

// Submit quiz attempt
router.post('/attempt', authMiddleware, roleCheck(['student']), asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;

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
}));

// Get quizzes for a course
router.get('/course/:courseId', authMiddleware, asyncHandler(async (req, res) => {
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
}));

// Get quiz attempts for student
router.get('/student/attempts', authMiddleware, roleCheck(['student']), asyncHandler(async (req, res) => {
  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId: req.user.userId },
    include: { quiz: true },
  });

  res.json(attempts);
}));

// Get quiz details
router.get('/:quizId', asyncHandler(async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: parseInt(req.params.quizId) },
    include: { questions: true },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  res.json(quiz);
}));

module.exports = router;
