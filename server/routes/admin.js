const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.admin_key;
  if (!key || key !== process.env.ADMIN_API_KEY) return res.status(403).json({ message: 'Forbidden - invalid admin key' });
  next();
}
router.post('/create-challenge', adminAuth, async (req, res) => {
  try {
    const { title, challengeType, weekStart, weekEnd, entryFee, fixtures } = req.body;
    const ch = new Challenge({ title, challengeType, weekStart, weekEnd, entryFee, fixtures, prizePool: 0, isActive: true });
    await ch.save();
    res.json({ message: 'Challenge created', challenge: ch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create challenge failed' });
  }
});
router.post('/close-challenge/:id', adminAuth, async (req, res) => {
  try {
    const ch = await Challenge.findById(req.params.id);
    if (!ch) return res.status(404).json({ message: 'Not found' });
    ch.isActive = false;
    if (req.body.fixtures) ch.fixtures = req.body.fixtures;
    await ch.save();
    res.json({ message: 'Challenge closed', challenge: ch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Close challenge failed' });
  }
});
module.exports = router;
