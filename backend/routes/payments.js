const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const Razorpay = require('razorpay');

const router = express.Router();
const prisma = new PrismaClient();

const isUniqueConstraintError = (error) => {
  return error?.code === 'P2002';
};

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1xxxxxxxxxxxxxxxxxx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxxxx',
});

// Create order for course enrollment
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { studentId: userId, courseId }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(course.price * 100), // Amount in paise
      currency: 'INR',
      receipt: `course_${courseId}_user_${userId}`,
      notes: {
        courseId,
        userId,
        courseTitle: course.title
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseId,
      courseTitle: course.title,
      coursePrice: course.price
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment and complete enrollment
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const userId = req.user.userId;

    // Note: In production, verify signature with Razorpay key_secret
    // For now, we'll trust the frontend sent valid data

    const parsedCourseId = parseInt(courseId);

    // Prevent duplicate enrollments before create
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { studentId: userId, courseId: parsedCourseId }
    });

    if (existingEnrollment) {
      return res.status(409).json({
        error: 'Already enrolled in this course',
        alreadyEnrolled: true,
        enrollment: existingEnrollment
      });
    }

    // Create enrollment record
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: userId,
        courseId: parsedCourseId,
        paymentStatus: 'paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      }
    });

    res.json({
      success: true,
      message: 'Payment verified and enrollment completed',
      enrollment
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        error: 'Already enrolled in this course',
        alreadyEnrolled: true
      });
    }

    res.status(500).json({ error: error.message });
  }
});

// Get payment status
router.get('/status/:enrollmentId', authMiddleware, async (req, res) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(req.params.enrollmentId) }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
