const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
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
    enum: ['avatar_01', 'avatar_02', 'avatar_03', 'avatar_04', 'avatar_05', 'avatar_06'],
    required: true,
    default: 'avatar_01'
  },
  profilePicture: {
    type: String
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    bestLevel: { type: Number, default: 1 },
    totalWins: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
