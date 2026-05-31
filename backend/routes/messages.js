const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify user is authenticated (optional for now - can be improved)
const authenticateToken = (req, res, next) => {
  // For now, we'll skip strict authentication to allow API testing
  // In production, implement proper JWT validation
  next();
};

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { senderId, receiverId, subject, content } = req.body;

    if (!senderId || !receiverId || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedSenderId = parseInt(senderId);
    const parsedReceiverId = parseInt(receiverId);

    if (isNaN(parsedSenderId) || isNaN(parsedReceiverId)) {
      return res.status(400).json({ error: 'Invalid sender or receiver ID' });
    }

    // Verify sender exists
    const sender = await prisma.user.findUnique({ where: { id: parsedSenderId } });
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: parsedReceiverId } });
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: parsedSenderId,
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
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get inbox (received messages)
router.get('/inbox/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId);

    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'Invalid userId' });
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
    console.error('Error fetching inbox:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sent messages
router.get('/sent/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId);

    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'Invalid userId' });
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
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation between two users
router.get('/conversation/:userId1/:userId2', authenticateToken, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const id1 = parseInt(userId1);
    const id2 = parseInt(userId2);

    if (isNaN(id1) || isNaN(id2)) {
      return res.status(400).json({ error: 'Invalid userIds' });
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
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.patch('/mark-read/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const parsedMessageId = parseInt(messageId);

    if (isNaN(parsedMessageId)) {
      return res.status(400).json({ error: 'Invalid messageId' });
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
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get list of instructors for a student (to send messages)
router.get('/instructors/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parsedStudentId = parseInt(studentId);

    if (isNaN(parsedStudentId)) {
      return res.status(400).json({ error: 'Invalid studentId' });
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
    console.error('Error fetching instructors:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const parsedMessageId = parseInt(messageId);

    if (isNaN(parsedMessageId)) {
      return res.status(400).json({ error: 'Invalid messageId' });
    }

    await prisma.message.delete({
      where: { id: parsedMessageId },
    });

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
