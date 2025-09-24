const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expenses");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("./token-verify");
const upload = multer();
const { uploadImagesToDropbox } = require("../utils/imageUploader"); // y
const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch,
});

// Add new expense
router.post(
  "/add-new-expense",
  upload.array("images"),
  verifyToken,
  async (req, res) => {
    try {
      const { description, type, amount, date } = req.body;
      const files = req.files; // multer stores files here

      if (!description || !type || !amount || !date) {
        return res.status(400).json({ message: "All fields are required" });
      }

      let imageUrls = [];
      if (files?.length) {
        // upload to Dropbox
        imageUrls = await uploadImagesToDropbox(files);
      }

      const expense = new Expense({
        description,
        type,
        amount,
        date,
        images: imageUrls,
      });

      const savedExpense = await expense.save();
      res.status(201).json({ expense: savedExpense });
    } catch (err) {
      console.error("Error saving expense:", err);
      res.status(500).json({ message: "Failed to save expense" });
    }
  }
);

// Get all expenses
router.get("/expenses-all-list", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json({ success: true, expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete expense
router.delete("/delete-expense/:id", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Expense deleted", expense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
