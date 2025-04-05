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
    required: true  // assuming all users must select one of your premade avatars
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

const User = mongoose.model('User', userSchema);
module.exports = User;
