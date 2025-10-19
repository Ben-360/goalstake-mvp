require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenges');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/goalstake', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error', err));
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => res.json({ status: 'GoalStake API' }));
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
