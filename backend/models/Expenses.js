const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    images: [{ type: String }], // Dropbox URLs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
