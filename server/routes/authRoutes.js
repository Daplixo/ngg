const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, nickname, avatarId, profilePicture } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    
    // Create new user
    const user = new User({
      username,
      nickname,
      avatarId: avatarId || 'avatar_01',
      profilePicture: profilePicture || null
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
        avatarId: user.avatarId,
        profilePicture: user.profilePicture,
        stats: user.stats
      }
    });
  } catch (error) {
    // Check for MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by username (for checking if username exists)
router.get('/username/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    
    if (user) {
      return res.status(200).json({ exists: true });
    }
    
    res.status(200).json({ exists: false });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
