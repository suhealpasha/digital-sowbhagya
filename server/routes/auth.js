const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRETE_KEY; 

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ userName: username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const payload = {
      id: user._id,
      username: user.userName,
      email: user.email,
      role: "user", 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
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
