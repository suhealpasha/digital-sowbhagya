const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const generateGSTBillPDF = require("../utils/gstBillGenerator");
const verifyToken = require("./token-verify");

const router = express.Router();

router.put("/update-booking/:id", verifyToken, async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    let updatedBillUrl = null;
    try {
      updatedBillUrl = await generateGSTBillPDF(updatedBooking);
      updatedBooking.gstBillUrl = updatedBillUrl;
      await updatedBooking.save();
    } catch (pdfErr) {
      console.warn("PDF regen error (safe to ignore if link exists):", pdfErr);
    }

    res.json({
      message: "Booking updated successfully",
      booking: updatedBooking,
      gstBillUrl: updatedBillUrl || updatedBooking.gstBillUrl || null,
    });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

router.post("/add-new-booking", verifyToken, async (req, res) => {
  try {
    const bookingData = req.body;
    const newBooking = new Booking(bookingData);
    const savedBooking = await newBooking.save();

    let billUrl = null;

    try {
      billUrl = await generateGSTBillPDF(savedBooking); 
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

router.get('/bookings-list', verifyToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.min(Math.max(1, parseInt(req.query.limit)), 100) || 20;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const search = req.query.search?.trim();
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

router.get("/bookings-all-list", verifyToken, async (req, res) => {
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

router.delete('/delete/:id', verifyToken, async (req, res) => {
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
