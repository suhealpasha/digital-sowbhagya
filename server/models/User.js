const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // You can hash later
});

module.exports = mongoose.model("User", userSchema);