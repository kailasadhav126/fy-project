'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment');
  process.exit(1);
}

mongoose.connect(mongoUri).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

app.get('/health', (req, res) => res.json({ ok: true }));

// Authentication Routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✓ Auth routes loaded successfully');
} catch (error) {
  console.error('✗ Failed to load auth routes:', error.message);
  console.error(error.stack);
}

// Public Routes
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/medical', require('./routes/medical'));
app.use('/api/parking', require('./routes/parking'));

// Protected Routes (Require Authentication)
app.use('/api/bookings', require('./routes/bookings'));

// Admin Routes
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/bookings', require('./routes/admin/bookings'));
app.use('/api/admin/hotels', require('./routes/admin/hotels'));
app.use('/api/admin/medical', require('./routes/admin/medical'));
app.use('/api/admin/parking', require('./routes/admin/parking'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on :${port}`));


