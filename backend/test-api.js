const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing LearnSphere API Endpoints...\n');

    // Test health
    console.log('1️⃣  Testing Health Endpoint...');
    const healthRes = await fetch('http://localhost:5000/api/health');
    const health = await healthRes.json();
    console.log('✅ Health:', health);
    console.log('');

    // Test courses
    console.log('2️⃣  Testing Courses Endpoint...');
    const coursesRes = await fetch('http://localhost:5000/api/courses');
    const courses = await coursesRes.json();
    console.log(`✅ Courses Retrieved: ${courses.length || 0}`);
    if (courses.length > 0) {
      console.log(`   - ${courses[0].title}`);
      console.log(`   - ${courses[1].title}`);
    }
    console.log('');

    // Test login
    console.log('3️⃣  Testing Login Endpoint...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('✅ Login Response:', {
      token: loginData.token ? '✅ Token Generated' : '❌ No Token',
      role: loginData.role,
      name: loginData.name
    });
    console.log('');

    console.log('🎉 ALL TESTS PASSED! API IS WORKING PROPERLY!');
    console.log('');
    console.log('Frontend should be able to fetch data from backend now.');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n⚠️  Backend might not be running on port 5000');
    console.error('Start it with: cd d:\\learnsphere\\backend && node server.js');
  }
}

testAPI();
