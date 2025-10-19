const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ucSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  points: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('UserChallenge', ucSchema);
