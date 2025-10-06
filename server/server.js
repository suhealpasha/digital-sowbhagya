require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const calendarRouter = require('./routes/calendar');
const { dropboxRouter } = require('./routes/dropbox'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);
app.use("/gst-bills", express.static("public/gst-bills"));
const bookingRouter = require("./routes/bookings");
const expenseRouter = require("./routes/expenses");
app.use("/api/bookings", bookingRouter);
app.use("/api/expenses", expenseRouter);
app.use('/api', calendarRouter);
app.use("/api", dropboxRouter);

// Health check route (required for Koyeb and good practice in general)
app.get('/', (req, res) => {
  res.send('Server is healthy!');
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB Atlas connected!');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));

  // Serve index.html for all unmatched routes (after API routes)
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'), function (err) {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send(err);
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
