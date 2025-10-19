const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  passwordHash: String,
  wallet: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  points: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', userSchema);
