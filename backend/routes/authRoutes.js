const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// LOGIN with improved error handling
router.post('/login', async (req, res) => {
  console.log('Login request body:', req.body);
  
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    console.log('Looking for user:', username);
    const user = await User.findOne({ username });
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User data:', {
      id: user?._id,
      username: user?.username,
      email: user?.email,
      password: user?.password ? 'Present' : 'Missing',
      passwordHash: user?.passwordHash ? 'Present' : 'Missing',
      passwordLength: user?.password?.length || 0,
      passwordHashLength: user?.passwordHash?.length || 0,
      role: user?.role,
      allFields: Object.keys(user.toObject())
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Comparing passwords...');
    console.log('Password from request:', password);
    console.log('Hash from database:', user.passwordHash || user.password);
    
    // Check which field contains the hash
    const storedHash = user.passwordHash || user.password;
    if (!storedHash) {
      console.error('No password hash found in user record');
      return res.status(500).json({ message: 'User data corrupted - no password hash' });
    }
    
    const ok = await bcrypt.compare(password, storedHash);
    console.log('Password match:', ok);
    
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    console.log('Login successful for user:', username);
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (err) {
    console.error('Login error details:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// REGISTER with improved error handling
router.post('/register', async (req, res) => {
  console.log('Register request body:', req.body);
  
  try {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    console.log('Checking if user exists...');
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    
    if (exists) {
      return res.status(409).json({ 
        message: 'User already exists',
        field: exists.username === username ? 'username' : 'email'
      });
    }
    
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('Creating user...');
    const user = await User.create({ 
      username, 
      email, 
      passwordHash, 
      role: role || 'user' 
    });
    
    console.log('User created successfully:', user.username);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Register error details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// // Add this route temporarily
// router.post('/reset-admin-password', async (req, res) => {
//   try {
//     const passwordHash = await bcrypt.hash('1234', 10);
//     const result = await User.updateOne(
//       { username: 'admin1' },
//       { $set: { passwordHash } }
//     );
//     res.json({ message: 'Password reset to 1234', result });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;