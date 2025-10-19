const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const referralSchema = new Schema({
  referrer: { type: Schema.Types.ObjectId, ref: 'User' },
  referred: { type: Schema.Types.ObjectId, ref: 'User' },
  credited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Referral', referralSchema);
