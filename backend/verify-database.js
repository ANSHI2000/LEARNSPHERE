const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying PostgreSQL Database Connection...\n');

    // Get all courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        instructor: { select: { name: true, email: true } }
      }
    });

    console.log('📚 COURSES IN DATABASE:');
    console.log('========================');
    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.title}`);
      console.log(`   Category: ${course.category}`);
      console.log(`   Instructor: ${course.instructor?.name || 'N/A'} (${course.instructor?.email || 'N/A'})`);
    });

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    console.log('\n\n👥 USERS IN DATABASE:');
    console.log('====================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      select: {
        id: true,
        student: { select: { name: true } },
        course: { select: { title: true } },
        paymentStatus: true,
        enrolledAt: true
      }
    });

    console.log('\n\n📝 ENROLLMENTS IN DATABASE:');
    console.log('==========================');
    if (enrollments.length > 0) {
      enrollments.slice(0, 5).forEach((enrollment, index) => {
        console.log(`${index + 1}. ${enrollment.student.name} → ${enrollment.course.title}`);
        console.log(`   Status: ${enrollment.paymentStatus}`);
      });
    } else {
      console.log('No enrollments yet');
    }

    console.log('\n✅ DATABASE VERIFICATION COMPLETE');
    console.log('\n📊 SUMMARY:');
    console.log(`   - ${courses.length} courses in database`);
    console.log(`   - ${users.length} users in database`);
    console.log(`   - ${enrollments.length} enrollments in database`);
    console.log('\n✨ This is REAL PostgreSQL data, NOT local storage!');

  } catch (error) {
    console.error('❌ DATABASE ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
