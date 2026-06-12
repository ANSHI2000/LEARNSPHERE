const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const { requireId } = require('../lib/parseId');

const router = express.Router();

const authenticateToken = (req, res, next) => {
  next();
};

const USER_SELECT = { id: true, name: true, email: true, role: true };

// Send a message
router.post('/send', authenticateToken, asyncHandler(async (req, res) => {
  const { senderId, receiverId, subject, content } = req.body;

  if (!senderId || !receiverId || !subject || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const parsedSenderId = requireId(res, senderId, 'sender ID');
  if (parsedSenderId === null) return;
  const parsedReceiverId = requireId(res, receiverId, 'receiver ID');
  if (parsedReceiverId === null) return;

  const sender = await prisma.user.findUnique({ where: { id: parsedSenderId } });
  if (!sender) {
    return res.status(404).json({ error: 'Sender not found' });
  }

  const receiver = await prisma.user.findUnique({ where: { id: parsedReceiverId } });
  if (!receiver) {
    return res.status(404).json({ error: 'Receiver not found' });
  }

  const message = await prisma.message.create({
    data: {
      senderId: parsedSenderId,
      receiverId: parsedReceiverId,
      subject,
      content,
    },
    include: {
      sender: { select: USER_SELECT },
      receiver: { select: USER_SELECT },
    },
  });

  res.json({
    success: true,
    message,
    notification: `Message sent to ${receiver.name}`,
  });
}));

// Get inbox (received messages)
router.get('/inbox/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const parsedUserId = requireId(res, req.params.userId, 'userId');
  if (parsedUserId === null) return;

  const messages = await prisma.message.findMany({
    where: { receiverId: parsedUserId },
    include: {
      sender: { select: USER_SELECT },
    },
    orderBy: { createdAt: 'desc' },
  });

  const unreadCount = await prisma.message.count({
    where: { receiverId: parsedUserId, isRead: false },
  });

  res.json({
    success: true,
    messages,
    unreadCount,
  });
}));

// Get sent messages
router.get('/sent/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const parsedUserId = requireId(res, req.params.userId, 'userId');
  if (parsedUserId === null) return;

  const messages = await prisma.message.findMany({
    where: { senderId: parsedUserId },
    include: {
      receiver: { select: USER_SELECT },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    messages,
  });
}));

// Get conversation between two users
router.get('/conversation/:userId1/:userId2', authenticateToken, asyncHandler(async (req, res) => {
  const id1 = requireId(res, req.params.userId1, 'userId1');
  if (id1 === null) return;
  const id2 = requireId(res, req.params.userId2, 'userId2');
  if (id2 === null) return;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: id1, receiverId: id2 },
        { senderId: id2, receiverId: id1 },
      ],
    },
    include: {
      sender: { select: USER_SELECT },
      receiver: { select: USER_SELECT },
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json({
    success: true,
    messages,
  });
}));

// Mark message as read
router.patch('/mark-read/:messageId', authenticateToken, asyncHandler(async (req, res) => {
  const parsedMessageId = requireId(res, req.params.messageId, 'messageId');
  if (parsedMessageId === null) return;

  const message = await prisma.message.update({
    where: { id: parsedMessageId },
    data: { isRead: true },
    include: {
      sender: { select: USER_SELECT },
      receiver: { select: USER_SELECT },
    },
  });

  res.json({
    success: true,
    message,
  });
}));

// Get list of instructors for a student (to send messages)
router.get('/instructors/:studentId', authenticateToken, asyncHandler(async (req, res) => {
  const parsedStudentId = requireId(res, req.params.studentId, 'studentId');
  if (parsedStudentId === null) return;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: parsedStudentId },
    include: {
      course: {
        include: {
          instructor: {
            select: USER_SELECT,
          },
        },
      },
    },
  });

  const instructors = [
    ...new Map(
      enrollments.map((e) => [
        e.course.instructor.id,
        e.course.instructor,
      ])
    ).values(),
  ];

  res.json({
    success: true,
    instructors,
  });
}));

// Delete message
router.delete('/:messageId', authenticateToken, asyncHandler(async (req, res) => {
  const parsedMessageId = requireId(res, req.params.messageId, 'messageId');
  if (parsedMessageId === null) return;

  await prisma.message.delete({
    where: { id: parsedMessageId },
  });

  res.json({
    success: true,
    message: 'Message deleted successfully',
  });
}));

module.exports = router;
