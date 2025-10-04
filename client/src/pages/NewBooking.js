import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createBooking, updateBooking } from "../services/api";
import { useBooking } from "../context/BookingContext";

const serviceOptions = [
  "hallRent",
  "cookingUtensils",
  "mantap",
  "darbarChairs",
  "cleaningLabour",
  "deepaLamps",
  "orchestraStage",
  "dolStage",
  "peta",
  "redCarpet",
  "micSet",
  "decorPlants",
  "godStatues",
  "holigeDosaStove",
  "lightDecoration",
  "roadCuttingSerialSet",
  "lightMusic",
  "hasemani",
  "speakers",
  "chairCovers",
];

const religions = ["Hindu", "Muslim", "Christian", "Other"];
const eventTypes = [
  "Wedding",
  "Reception",
  "Engagement",
  "Birthday",
  "Badoota",
  "Prayer meet",
  "Namakarna",
];

const BookingForm = () => {
  const { editBooking, isEdit } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    alternative_phone: "",
    date: "",
    days: 1,
    event_type: "",
    religion: "",
    startTime: "",
    endTime: "",
    services: {},
    cost: 0,
    advance: 0,
    otherCharges: 0,
    generatorHours: 0,
    unitUsed: 0,
    discount: 0,
    gstIncluded: false, // GST unchecked by default
  });

  const [costSummary, setCostSummary] = useState({
    baseCost: 0,
    gstAmount: 0,
    totalCost: 0,
    balance: 0,
  });

  const GENERATOR_COST_PER_HOUR = 700;
  const UNIT_COST = 20;
  const GST_RATE = 0.18;

  useEffect(() => {
    if (editBooking) {
      setForm({
        name: editBooking.name || "",
        address: editBooking.address || "",
        phone: editBooking.phone || "",
        alternative_phone: editBooking.alternative_phone || "",
        date: editBooking.date ? editBooking.date.split("T")[0] : "",
        days: editBooking.days || 1,
        event_type: editBooking.event_type || "",
        religion: editBooking.religion || "",
        startTime: editBooking.timings?.split(" to ")[0] || "",
        endTime: editBooking.timings?.split(" to ")[1] || "",
        services: editBooking.services || {},
        cost: editBooking.cost || "",
        advance: editBooking.advance || "",
        otherCharges: editBooking.otherCharges || "",
        generatorHours: editBooking.generatorHours || "",
        unitUsed: editBooking.unitUsed || "",
        discount: editBooking.discount || "",
        gstIncluded: editBooking.gstIncluded ?? false,
      });
    } else {
      // Reset form when creating new booking
      setForm({
        name: "",
        address: "",
        phone: "",
        alternative_phone: "",
        date: "",
        days: "", // Empty to force user to enter
        event_type: "",
        religion: "",
        startTime: "",
        endTime: "",
        services: {},
        cost: "", // Empty
        advance: "", // Empty
        otherCharges: "",
        generatorHours: "",
        unitUsed: "",
        discount: "",
        gstIncluded: false,
      });
    }
  }, [editBooking]);

  useEffect(() => {
    const base = parseFloat(form.cost || 0);
    const other = parseFloat(form.otherCharges || 0);
    const genCost = form.generatorHours * GENERATOR_COST_PER_HOUR;
    const unitCost = form.unitUsed * UNIT_COST;
    const subtotal = base + other + genCost + unitCost;
    const discount = parseFloat(form.discount || 0);
    const discountedTotal = subtotal - discount;
    let gstAmount = 0;
let totalCost = 0;
if (form.gstIncluded) {
  gstAmount = discountedTotal * GST_RATE;
  totalCost = discountedTotal + gstAmount;
} else {
  gstAmount = 0;
  totalCost = discountedTotal;
}
    gstAmount = parseFloat(gstAmount.toFixed(2));
    totalCost = parseFloat(totalCost.toFixed(2));
    const balance = parseFloat(
      (totalCost - parseFloat(form.advance || 0)).toFixed(2)
    );
    setCostSummary({
      baseCost: parseFloat((subtotal - discount).toFixed(2)),
      gstAmount,
      totalCost,
      balance,
      genHours: form.generatorHours,
      kebHours: form.kebHours,
    });
  }, [
    form.cost,
    form.otherCharges,
    form.generatorHours,
    form.unitUsed,
    form.discount,
    form.gstIncluded,
    form.advance,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServiceChange = (service) => {
    setForm((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const requiredFields = ["name", "phone", "date", "event_type", "days", "cost", "advance"];
    const hasEmpty = requiredFields.some((field) => !form[field] && form[field] !== 0);
    if (hasEmpty) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      setIsSubmitting(true);

      const payload = {
        ...form,
        timings: `${form.startTime} to ${form.endTime}`,
        baseCost: costSummary.baseCost,
        gstAmount: costSummary.gstAmount,
        totalCost: costSummary.totalCost,
        balance: costSummary.balance,
      };

      delete payload.startTime;
      delete payload.endTime;

      if (editBooking?._id) {
        await updateBooking(editBooking._id, payload);
      } else {
        await createBooking(payload);
      }

      const successMessage = editBooking?._id
        ? "Booking updated successfully!"
        : "Booking created successfully!";

      toast.success(successMessage);

      setTimeout(() => {
        window.location.href = "/booking-list"; // update route if different
      }, 1000);

      setForm({
        name: "",
        address: "",
        phone: "",
        alternative_phone: "",
        date: "",
        days: 1,
        event_type: "",
        religion: "",
        startTime: "",
        endTime: "",
        services: {},
        cost: 0,
        advance: 0,
        generatorHours: 0,
        unitUsed: 0,
        discount: 0,
        gstIncluded: true,
      });
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Error submitting booking"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 3, maxWidth: "100%", borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom color="primary" fontWeight={600}>
        {editBooking ? "✏️ Edit Booking" : "📝 New Booking Form"}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <form onSubmit={handleSubmit}>
        {/* Personal & Event Details */}
        <Typography variant="h6" gutterBottom>
          Personal & Event Details
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Full Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          {/* Phone & Alternative Phone */}
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <TextField
              fullWidth
              label="Phone *"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Alternative Phone"
              name="alternative_phone"
              value={form.alternative_phone}
              onChange={handleChange}
            />
          </Box>

          <TextField
            fullWidth
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          {/* Event Date & Number of Days */}
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <TextField
              fullWidth
              type="date"
              label="Event Date *"
              name="date"
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Number of Days *"
              name="days"
              inputProps={{ min: 1 }}
              value={form.days}
              onChange={handleChange}
              required
            />
          </Box>

          {/* Event Type & Religion */}
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <TextField
              select
              fullWidth
              label="Event Type *"
              name="event_type"
              value={form.event_type}
              onChange={handleChange}
              required
            >
              {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Religion"
              name="religion"
              value={form.religion}
              onChange={handleChange}
            >
              {religions.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Start & End Time */}
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              name="startTime"
              InputLabelProps={{ shrink: true }}
              value={form.startTime}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              type="time"
              label="End Time"
              name="endTime"
              InputLabelProps={{ shrink: true }}
              value={form.endTime}
              onChange={handleChange}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Services */}
        <Typography variant="h6" gutterBottom>
          Services Required
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {serviceOptions.map((service) => (
            <FormControlLabel
              key={service}
              control={
                <Checkbox
                  checked={!!form.services[service]}
                  onChange={() => handleServiceChange(service)}
                />
              }
              label={service
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
              sx={{ flex: "0 0 250px" }}
            />
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Billing */}
        <Typography variant="h6" gutterBottom>
          Billing Details
        </Typography>

        {/* Base Cost & Advance */}
        <Box sx={{ display: "flex", gap: 2, width: "100%", mb: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Base Cost (Manual) *"
            name="cost"
            inputProps={{ min: 0, step: "any" }}
            value={form.cost}
            onChange={handleChange}
            required
            disabled={editBooking}
          />
          <TextField
            fullWidth
            type="number"
            label="Advance Amount *"
            name="advance"
            inputProps={{ min: 0, step: "any" }}
            value={form.advance}
            onChange={handleChange}
            disabled={editBooking}
            required
          />
        </Box>

        {/* Other Charges & Discount */}
        <Box sx={{ display: "flex", gap: 2, width: "100%", mb: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Other Charges"
            name="otherCharges"
            inputProps={{ min: 0, step: "any" }}
            value={form.otherCharges}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            type="number"
            label="Discount"
            name="discount"
            inputProps={{ min: 0, step: "any" }}
            value={form.discount}
            onChange={handleChange}
          />
        </Box>

        {/* Generator & Electricity */}
        <Box sx={{ display: "flex", gap: 2, width: "100%", mb: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Electricity Units Used"
            name="unitUsed"
            inputProps={{ min: 0, step: "any" }}
            value={form.unitUsed}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            type="number"
            label="Generator Hours"
            name="generatorHours"
            inputProps={{ min: 0, step: "any" }}
            value={form.generatorHours}
            onChange={handleChange}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              name="gstIncluded"
              checked={form.gstIncluded}
              onChange={handleChange}
            />
          }
          label="Include GST (18%)"
        />

        {/* Cost Summary */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            Base Cost: ₹{costSummary.baseCost.toLocaleString()}
          </Typography>

          <Typography variant="body1">
            Generator Hours ({form.generatorHours} * {GENERATOR_COST_PER_HOUR})
            ₹{(form.generatorHours * GENERATOR_COST_PER_HOUR).toLocaleString()}
          </Typography>

          <Typography variant="body1">
            KEB Units Used ({form.unitUsed} * {UNIT_COST}) ₹
            {(form.unitUsed * UNIT_COST).toLocaleString()}
          </Typography>

          <Typography variant="body1">
            Discount: ₹{parseFloat(form.discount || 0).toLocaleString()}
          </Typography>

          <Typography variant="body1">
            GST (18%): ₹{costSummary.gstAmount.toLocaleString()}
          </Typography>

          <Typography variant="body1">
            Advance Paid: ₹{parseFloat(form.advance || 0).toLocaleString()}
          </Typography>

          <Typography variant="h6" fontWeight="bold">
            Total Cost: ₹{costSummary.totalCost.toLocaleString()}
          </Typography>

          <Typography variant="h6" color="error" fontWeight="bold">
            Balance: ₹{costSummary.balance.toLocaleString()}
          </Typography>
        </Box>

        <Box mt={4}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting
              ? editBooking
                ? "Updating..."
                : "Submitting..."
              : editBooking
              ? "Update Booking"
              : "Submit Booking"}
          </Button>
        </Box>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </Paper>
  );
};

export default BookingForm;
