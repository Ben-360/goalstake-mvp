const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const predictionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  matchId: String,
  pick: String,
  exactScore: { type: String, default: null },
  pointsAwarded: { type: Number, default: 0 }
});
module.exports = mongoose.model('Prediction', predictionSchema);
