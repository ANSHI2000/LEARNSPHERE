const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const Razorpay = require('razorpay');

const router = express.Router();
const prisma = new PrismaClient();

const isUniqueConstraintError = (error) => {
  return error?.code === 'P2002';
};

// Initialize Razorpay
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set. Payment features will not work.');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

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
