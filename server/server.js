require('dotenv').config(); // At the top

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

// Use environment variable for MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Atlas connected!');
}).catch(err => {
  console.error('Connection error:', err);
});

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
