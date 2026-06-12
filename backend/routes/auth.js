const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');

const router = express.Router();

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const { email, name, password, role } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
      role: role || 'student',
    },
  });

  res.json({ 
    success: true, 
    userId: user.id, 
    role: user.role,
    message: 'User registered successfully'
  });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, passwordLength: password?.length });

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  console.log('User found:', !!user);
  
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  console.log('Comparing password:', {
    plaintext: password,
    stored_hash: user.password?.substring(0, 20) + '...'
  });

  const validPassword = await bcrypt.compare(password, user.password);
  console.log('Password valid:', validPassword);
  
  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ 
    success: true, 
    token, 
    role: user.role, 
    userId: user.id,
    name: user.name 
  });
}));

module.exports = router;
