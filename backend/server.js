const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const calendarRouter = require('./routes/calendar');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/gst-bills", express.static("public/gst-bills"));
const bookingRouter = require("./routes/bookings");
const expenseRouter = require("./routes/expenses");
app.use("/api/bookings", bookingRouter);
app.use("/api/expenses", expenseRouter);
app.use('/api', calendarRouter);

const connection_string = 'mongodb+srv://suhalpasha:M3fSfEnTZT3hzzxc@cluster0.vbwjpin.mongodb.net/'
// MongoDB Connection
mongoose.connect(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Atlas connected!');
}).catch(err => {
  console.error('Connection error:', err);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
