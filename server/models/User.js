const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  nickname: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  avatarId: {
    type: String,
    required: true  // assuming every player picks an avatar
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    bestLevel: { type: Number, default: 1 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
