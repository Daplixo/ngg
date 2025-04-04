const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get top players by best level
router.get('/best-level', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topPlayers = await User.find({})
      .sort({ 'stats.bestLevel': -1, 'stats.gamesPlayed': 1 })
      .limit(limit)
      .select('username nickname profilePicture stats.bestLevel stats.gamesPlayed');
    
    res.json(topPlayers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top players by total wins
router.get('/total-wins', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topPlayers = await User.find({})
      .sort({ 'stats.totalWins': -1 })
      .limit(limit)
      .select('username nickname profilePicture stats.totalWins stats.gamesPlayed');
    
    res.json(topPlayers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
