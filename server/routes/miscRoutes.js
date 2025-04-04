const express = require('express');
const router = express.Router();

// Simple ping route for API availability check
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is available' });
});

module.exports = router;
