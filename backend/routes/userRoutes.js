const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Public route (moved above authenticate so everyone can access)
router.get('/public', (req, res) => {
  res.json({ message: 'Public data visible to everyone' });
});

// Require authentication for all routes below
router.use(authenticate);

// Read profile (requires any logged-in user)
router.get('/profile', authorize('read'), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username })
      .select('-passwordHash -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update profile (requires write permission)
router.post('/profile', authorize('write'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOneAndUpdate(
      { username: req.user.username },
      { email },
      { new: true }
    ).select('-passwordHash -passwordResetToken -passwordResetExpires');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a user (admin / delete permission)
router.delete('/user/:id', authorize('delete'), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;