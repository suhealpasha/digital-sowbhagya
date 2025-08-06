const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking"); // Your mongoose model file
const generateGSTBillPDF = require("../utils/gstBillGenerator"); // Your custom GST PDF generator module
const router = express.Router();

router.put("/update-booking/:id", async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add-new-booking", async (req, res) => {
  try {
    const bookingData = req.body;

    // Save booking to MongoDB initially
    const newBooking = new Booking(bookingData);
    const savedBooking = await newBooking.save();

    let billUrl = null;

    try {
      // Always generate a bill PDF (GST or regular)
      billUrl = await generateGSTBillPDF(savedBooking); // Replace this if needed
      savedBooking.gstBillUrl = billUrl;
      await savedBooking.save();
    } catch (pdfError) {
      console.error("Failed to generate bill PDF:", pdfError);
    }

    res.status(201).json({
      booking: savedBooking,
      gstBillUrl: billUrl || null,
    });
  } catch (err) {
    console.error("Error saving booking:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

router.get('/bookings-list', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.min(Math.max(1, parseInt(req.query.limit)), 100) || 20;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const search = req.query.search?.trim();

    // Create a filter
    const filter = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { event_type: searchRegex },
        { religion: searchRegex },
      ];
    }

    const bookings = await Booking.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.json({ bookings, total, page, limit });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

router.get("/bookings-all-list", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.min(Math.max(1, parseInt(req.query.limit)), 100) || 20;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const search = req.query.search?.trim();

    const filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: regex },
        { phone: regex },
        { event_type: regex },
        { religion: regex },
      ];
    }

    const bookings = await Booking.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      bookings,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({
      message: "Failed to fetch all bookings",
      error: err.message,
    });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Failed to delete booking:', err);
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

module.exports = router;
