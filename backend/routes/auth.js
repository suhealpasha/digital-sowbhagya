const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User"); // ✅ Your Mongoose model for users

const JWT_SECRET = "your_jwt_secret_key"; // ✅ Replace with env var in production

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. ✅ Find user by userName
    const user = await User.findOne({ userName: username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. ✅ Prepare payload (excluding sensitive info)
    const payload = {
      id: user._id,
      username: user.userName,
      email: user.email,
      role: "user", // or "admin" if role stored in DB
    };

    // 3. ✅ Sign JWT
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // 4. ✅ Return token and user info (excluding password)
    const userWithoutPassword = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      userName: user.userName,
    };

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
