const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'student@test.com' }
    });

    console.log('\n=== DATABASE CHECK ===');
    console.log('Email:', user?.email);
    console.log('Name:', user?.name);
    console.log('Role:', user?.role);
    console.log('Password Hash:', user?.password?.substring(0, 30) + '...');

    if (user) {
      console.log('\n=== PASSWORD CHECK ===');
      const testPassword = 'password123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('Testing password: "password123"');
      console.log('Password valid:', isValid);

      if (!isValid) {
        console.log('\nDEBUG: Hashing test password now...');
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('New hash:', newHash);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
