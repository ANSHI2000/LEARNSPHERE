const prisma = require('../lib/prisma');

const verifyCourseOwnership = async (req, res, courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return false;
  }

  if (course.instructorId !== req.user.userId && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Not authorized' });
    return false;
  }

  return true;
};

module.exports = { verifyCourseOwnership };
