const express = require('express');
const router = express.Router();
const User = require('../models/User');
router.post('/deposit', async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.wallet += Number(amount || 0);
  await user.save();
  res.json({ message: 'Deposit added', balance: user.wallet });
});
router.post('/withdraw', async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.wallet < amount) return res.status(400).json({ message: 'Insufficient funds' });
  user.wallet -= amount;
  await user.save();
  res.json({ message: 'Withdrawal processed (prototype)', balance: user.wallet });
});
module.exports = router;
