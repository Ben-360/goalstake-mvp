const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const fantasySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  players: [
    {
      playerId: String,
      name: String,
      team: String,
      position: String
    }
  ],
  points: { type: Number, default: 0 }
});
module.exports = mongoose.model('FantasyPick', fantasySchema);
