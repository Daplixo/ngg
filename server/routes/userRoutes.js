const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// TEMPORARY: Get all users (for backend sync test)
router.get('/', async (req, res) => {
  try {
    console.log('📦 Trying to fetch users...');
    const users = await User.find().select('-password');
    console.log('✅ Users fetched:', users);
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
//testing

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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
    const { nickname, username, avatarId, profilePicture } = req.body;
    
    // Check if username already exists (if being changed)
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }
    
    const updateData = {};
    if (nickname) updateData.nickname = nickname;
    if (username) updateData.username = username;
    if (avatarId) updateData.avatarId = avatarId;
    if (profilePicture) updateData.profilePicture = profilePicture;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user statistics by username (no auth required)
router.put('/stats', async (req, res) => {
  try {
    const { username, stats } = req.body;
    
    // Validate required fields
    if (!username || !stats) {
      return res.status(400).json({ error: 'Username and stats are required' });
    }
    
    console.log(`🔄 Updating stats for user ${username}:`, stats);
    
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $set: { stats } },
      { new: true }
    );
    
    if (!updatedUser) {
      console.log(`❌ User not found: ${username}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`✅ Stats updated successfully for ${username}`);
    return res.status(200).json({ 
      message: 'Stats updated successfully',
      user: {
        username: updatedUser.username,
        stats: updatedUser.stats
      }
    });
  } catch (err) {
    console.error('❌ Error updating stats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account by ID (auth middleware)
router.delete('/', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account by username (no auth required)
router.delete('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await User.findOneAndDelete({ username });
    
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account by username:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
