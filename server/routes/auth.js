const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Referral = require('../models/Referral');
const router = express.Router();
function genCode(name) {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return (name ? name.split(' ')[0] : 'USER').toUpperCase().slice(0,4) + suffix;
}
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, referralCode } = req.body;
    const hash = password ? await bcrypt.hash(password, 10) : null;
    const user = new User({ name, email, phone, passwordHash: hash, referralCode: genCode(name) });
    if (referralCode) {
      const refUser = await User.findOne({ referralCode });
      if (refUser) {
        user.referredBy = refUser._id;
      }
    }
    await user.save();
    if (user.referredBy) {
      await Referral.create({ referrer: user.referredBy, referred: user._id, credited: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, referralCode: user.referralCode } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, referralCode: user.referralCode } });
  } catch (err) {
    res.status(500).json({ message: 'Login error' });
  }
});
module.exports = router;
