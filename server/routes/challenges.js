const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const Prediction = require('../models/Prediction');
const FantasyPick = require('../models/FantasyPick');
const User = require('../models/User');
const UserChallenge = require('../models/UserChallenge');
const Referral = require('../models/Referral');
async function auth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: 'Missing x-user-id header (prototype only)' });
  req.user = await User.findById(userId);
  next();
}
router.get('/current', async (req, res) => {
  const challenges = await Challenge.find({ isActive: true }).sort({ weekStart: -1 });
  res.json(challenges);
});
router.post('/:id/join', auth, async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return res.status(404).json({ message: 'No challenge' });
  if (challenge.entryFee > 0) {
    if (req.user.wallet < challenge.entryFee) return res.status(400).json({ message: 'Insufficient balance' });
    req.user.wallet -= challenge.entryFee;
    challenge.prizePool += challenge.entryFee;
    await req.user.save();
    await challenge.save();
  }
  let uc = await UserChallenge.findOne({ user: req.user._id, challenge: challenge._id });
  if (!uc) {
    uc = new UserChallenge({ user: req.user._id, challenge: challenge._id, points: 0 });
    await uc.save();
  }
  const referralRecord = await Referral.findOne({ referred: req.user._id, credited: false });
  if (referralRecord) {
    const referrer = await User.findById(referralRecord.referrer);
    if (referrer) {
      referrer.wallet += 200;
      await referrer.save();
      referralRecord.credited = true;
      await referralRecord.save();
    }
  }
  res.json({ message: 'Joined', challengeId: challenge._id });
});
router.post('/:id/predictions', auth, async (req, res) => {
  const { predictions } = req.body;
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return res.status(404).json({ message: 'No challenge' });
  if (challenge.challengeType !== 'PREDICTION') return res.status(400).json({ message: 'Challenge is not a prediction type' });
  await Prediction.deleteMany({ user: req.user._id, challenge: challenge._id });
  const docs = predictions.map(p => ({ user: req.user._id, challenge: challenge._id, matchId: p.matchId, pick: p.pick, exactScore: p.exactScore || null }));
  await Prediction.insertMany(docs);
  let uc = await UserChallenge.findOne({ user: req.user._id, challenge: challenge._id });
  if (!uc) {
    uc = new UserChallenge({ user: req.user._id, challenge: challenge._id, points: 0 });
    await uc.save();
  }
  res.json({ message: 'Predictions saved' });
});
router.post('/:id/scoreline', auth, async (req, res) => {
  const { predictions } = req.body;
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return res.status(404).json({ message: 'No challenge' });
  if (challenge.challengeType !== 'SCORELINE') return res.status(400).json({ message: 'Challenge is not a scoreline type' });
  await Prediction.deleteMany({ user: req.user._id, challenge: challenge._id });
  const docs = predictions.map(p => ({ user: req.user._id, challenge: challenge._id, matchId: p.matchId, pick: null, exactScore: p.exactScore }));
  await Prediction.insertMany(docs);
  let uc = await UserChallenge.findOne({ user: req.user._id, challenge: challenge._id });
  if (!uc) {
    uc = new UserChallenge({ user: req.user._id, challenge: challenge._id, points: 0 });
    await uc.save();
  }
  res.json({ message: 'Scoreline predictions saved' });
});
router.post('/:id/fantasy', auth, async (req, res) => {
  const { players } = req.body;
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return res.status(404).json({ message: 'No challenge' });
  if (challenge.challengeType !== 'FANTASY') return res.status(400).json({ message: 'Challenge is not a fantasy type' });
  await FantasyPick.deleteMany({ user: req.user._id, challenge: challenge._id });
  const pick = new FantasyPick({ user: req.user._id, challenge: challenge._id, players });
  await pick.save();
  let uc = await UserChallenge.findOne({ user: req.user._id, challenge: challenge._id });
  if (!uc) {
    uc = new UserChallenge({ user: req.user._id, challenge: challenge._id, points: 0 });
    await uc.save();
  }
  res.json({ message: 'Fantasy saved' });
});
router.get('/:id/leaderboard', async (req, res) => {
  const challengeId = req.params.id;
  const rows = await UserChallenge.find({ challenge: challengeId }).sort({ points: -1 }).limit(100).populate('user','name');
  res.json(rows.map(r=>({ _id: r.user._id, name: r.user.name, points: r.points })));
});
module.exports = router;
