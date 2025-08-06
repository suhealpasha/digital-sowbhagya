import React, { useState, useMemo, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { getAllBookings } from "../services/api";

const formatBookingDateToYYYYMMDD = (dateStr) => {
  if (!dateStr) return "";

  const [year, month, day] = dateStr.split("-");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const ListCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [open, setOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getAllBookings();
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Extract unique years from bookings
  const availableYears = useMemo(() => {
    const years = bookings.map((b) => b.date.split("/")[2]);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (yearFilter === "all") return bookings;
    return bookings.filter((b) => b.date.endsWith(`/${yearFilter}`));
  }, [bookings, yearFilter]);

  const events = useMemo(
    () =>
      filteredBookings.map((booking) => ({
        title: `${booking.name} - ${booking.event_type}`,
        date: formatBookingDateToYYYYMMDD(booking.date),
        extendedProps: { ...booking },
      })),
    [filteredBookings]
  );

  const handleEventClick = (clickInfo) => {
    setSelectedBooking(clickInfo.event.extendedProps);
    setOpen(true);
  };

  if (loading) return <Typography>Loading bookings...</Typography>;

  return (
    <Box mt={3}>
      {/* Filter Dropdown */}
      <Box mb={2}>
        <FormControl size="small">
          <InputLabel>Year</InputLabel>
          <Select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            label="Year"
          >
            <MenuItem value="all">All</MenuItem>
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Calendar View */}
      <FullCalendar
        plugins={[listPlugin, interactionPlugin]}
        initialView="listMonth"
        events={events}
        eventClick={handleEventClick}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "listMonth",
        }}
        views={{
          listMonth: { buttonText: "Month" },
        }}
      />

      {/* Booking Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>📋 Booking Details</DialogTitle>
        <DialogContent dividers>
          {selectedBooking ? (
            <Box>
              <Typography><strong>Date:</strong> {selectedBooking.date}</Typography>
              <Typography><strong>Timings:</strong> {selectedBooking.timings}</Typography>
              <Typography><strong>Name:</strong> {selectedBooking.name}</Typography>
              <Typography><strong>Event:</strong> {selectedBooking.event_type}</Typography>
              <Typography><strong>Religion:</strong> {selectedBooking.religion}</Typography>
              <Typography><strong>Days:</strong> {selectedBooking.days}</Typography>
              <Typography><strong>Address:</strong> {selectedBooking.address}</Typography>
              <Typography><strong>Phone:</strong> {selectedBooking.phone}</Typography>
            </Box>
          ) : (
            <Typography>No booking info available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListCalendar;
