const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// TEMPORARY: Get all users (for backend sync test)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { nickname, username, profilePicture } = req.body;
    
    // Check if username already exists (if being changed)
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    const updateData = {};
    if (nickname) updateData.nickname = nickname;
    if (username) updateData.username = username;
    if (profilePicture) updateData.profilePicture = profilePicture;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user statistics
router.put('/stats', auth, async (req, res) => {
  try {
    const { gamesPlayed, bestLevel, totalWins, totalAttempts } = req.body;
    
    const updateData = { stats: {} };
    if (gamesPlayed !== undefined) updateData.stats.gamesPlayed = gamesPlayed;
    if (bestLevel !== undefined) updateData.stats.bestLevel = bestLevel;
    if (totalWins !== undefined) updateData.stats.totalWins = totalWins;
    if (totalAttempts !== undefined) updateData.stats.totalAttempts = totalAttempts;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
