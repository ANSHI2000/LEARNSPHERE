const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const courses = await prisma.course.findMany({ select: { id: true, title: true } });
  const quizzes = await prisma.quiz.findMany({
    include: {
      course: { select: { id: true, title: true } },
      questions: true,
    },
  });

  console.log('COURSES', courses);
  console.log('QUIZZES', quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    courseId: q.courseId,
    courseTitle: q.course?.title,
    questionCount: q.questions.length,
  })));

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
