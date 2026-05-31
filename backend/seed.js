const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Starting seed...');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const student = await prisma.user.upsert({
      where: { email: 'student@test.com' },
      update: {},
      create: {
        email: 'student@test.com',
        name: 'Test Student',
        password: hashedPassword,
        role: 'student',
      },
    });

    const instructor = await prisma.user.upsert({
      where: { email: 'instructor@test.com' },
      update: {},
      create: {
        email: 'instructor@test.com',
        name: 'John Instructor',
        password: hashedPassword,
        role: 'instructor',
      },
    });

    const admin = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('Created test users');

    // Create sample courses (only if they don't exist)
    const course1 = await prisma.course.create({
      data: {
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript to build responsive websites.',
        category: 'Web Development',
        instructorId: instructor.id,
        price: 0,
        published: true,
      },
    }).catch(() => null);

    const course2 = await prisma.course.create({
      data: {
        title: 'React Advanced Concepts',
        description: 'Master React hooks, context API, and performance optimization techniques.',
        category: 'Web Development',
        instructorId: instructor.id,
        price: 49.99,
        published: true,
      },
    }).catch(() => null);

    const course3 = await prisma.course.create({
      data: {
        title: 'Backend Development with Node.js',
        description: 'Build scalable backend applications using Node.js, Express, and PostgreSQL.',
        category: 'Backend',
        instructorId: instructor.id,
        price: 59.99,
        published: true,
      },
    }).catch(() => null);

    const course4 = await prisma.course.create({
      data: {
        title: 'Database Design & SQL',
        description: 'Learn to design efficient databases and write complex SQL queries.',
        category: 'Database',
        instructorId: instructor.id,
        price: 39.99,
        published: true,
      },
    }).catch(() => null);

    const course5 = await prisma.course.create({
      data: {
        title: 'Python for Data Science',
        description: 'Use Python libraries for data analysis, visualization, and machine learning basics.',
        category: 'Data Science',
        instructorId: instructor.id,
        price: 69.99,
        published: true,
      },
    }).catch(() => null);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
