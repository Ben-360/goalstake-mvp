const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const challengeSchema = new Schema({
  title: String,
  challengeType: { type: String, enum: ['PREDICTION','SCORELINE','FANTASY','REFERRAL'], default: 'PREDICTION' },
  weekStart: Date,
  weekEnd: Date,
  entryFee: { type: Number, default: 200 },
  prizePool: { type: Number, default: 0 },
  fixtures: [
    {
      matchId: String,
      home: String,
      away: String,
      kickoff: Date,
      result: { type: String, default: null }
    }
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Challenge', challengeSchema);
