const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Optional for local dev

// Routers
const calendarRouter = require('./routes/calendar');
const { dropboxRouter } = require('./routes/dropbox');
const authRouter = require('./routes/auth');
const bookingRouter = require('./routes/bookings');
const expenseRouter = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving (e.g., PDF bills)
app.use("/gst-bills", express.static(path.join(__dirname, '../public/gst-bills')));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/expenses", expenseRouter);
app.use('/api', calendarRouter);
app.use("/api", dropboxRouter);

// MongoDB Connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected!');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Serve React frontend (client/build)
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all: serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
