const mongoose = require('mongoose');

const Roles = {
  ADMIN: 1,
  MANAGER: 2,
  MEMBER: 3
};

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    enum: [Roles.ADMIN, Roles.MANAGER, Roles.MEMBER],
    default: Roles.MEMBER
  },
    companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  token: {
    type: String
  }
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Roles
};
