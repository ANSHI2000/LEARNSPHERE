const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverId, subject, content } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedReceiverId = parseInt(receiverId);

    if (isNaN(parsedReceiverId)) {
      return res.status(400).json({ error: 'Invalid receiver ID' });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: parsedReceiverId } });
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: parsedReceiverId,
        subject,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.json({
      success: true,
      message,
      notification: `Message sent to ${receiver.name}`,
    });
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get inbox (received messages)
router.get('/inbox/:userId', authMiddleware, async (req, res) => {
  try {
    const parsedUserId = parseInt(req.params.userId);

    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Users can only access their own inbox
    if (parsedUserId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: { receiverId: parsedUserId },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Count unread messages
    const unreadCount = await prisma.message.count({
      where: { receiverId: parsedUserId, isRead: false },
    });

    res.json({
      success: true,
      messages,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching inbox:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sent messages
router.get('/sent/:userId', authMiddleware, async (req, res) => {
  try {
    const parsedUserId = parseInt(req.params.userId);

    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Users can only access their own sent messages
    if (parsedUserId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: { senderId: parsedUserId },
      include: {
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching sent messages:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId1/:userId2', authMiddleware, async (req, res) => {
  try {
    const id1 = parseInt(req.params.userId1);
    const id2 = parseInt(req.params.userId2);

    if (isNaN(id1) || isNaN(id2)) {
      return res.status(400).json({ error: 'Invalid userIds' });
    }

    // Users can only access conversations they are part of
    if (req.user.userId !== id1 && req.user.userId !== id2) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: id1, receiverId: id2 },
          { senderId: id2, receiverId: id1 },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark message as read
router.patch('/mark-read/:messageId', authMiddleware, async (req, res) => {
  try {
    const parsedMessageId = parseInt(req.params.messageId);

    if (isNaN(parsedMessageId)) {
      return res.status(400).json({ error: 'Invalid messageId' });
    }

    // Verify the message belongs to the authenticated user
    const existing = await prisma.message.findUnique({ where: { id: parsedMessageId } });
    if (!existing) {
      return res.status(404).json({ error: 'Message not found' });
    }
    if (existing.receiverId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await prisma.message.update({
      where: { id: parsedMessageId },
      data: { isRead: true },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error marking message as read:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get list of instructors for a student (to send messages)
router.get('/instructors/:studentId', authMiddleware, async (req, res) => {
  try {
    const parsedStudentId = parseInt(req.params.studentId);

    if (isNaN(parsedStudentId)) {
      return res.status(400).json({ error: 'Invalid studentId' });
    }

    // Users can only look up their own instructors
    if (parsedStudentId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get instructors from courses the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: parsedStudentId },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true, role: true },
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
  } catch (error) {
    console.error('Error fetching instructors:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete message
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const parsedMessageId = parseInt(req.params.messageId);

    if (isNaN(parsedMessageId)) {
      return res.status(400).json({ error: 'Invalid messageId' });
    }

    // Verify the message belongs to the authenticated user
    const existing = await prisma.message.findUnique({ where: { id: parsedMessageId } });
    if (!existing) {
      return res.status(404).json({ error: 'Message not found' });
    }
    if (existing.senderId !== req.user.userId && existing.receiverId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.message.delete({
      where: { id: parsedMessageId },
    });

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
