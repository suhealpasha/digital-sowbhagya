import React, { useEffect, useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import {
  getHijriCalendar,
  getIndianHolidays,
  getHotMarriageDates,
  getHinduCalendar,
  getAllBookings,
} from "../services/api";
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import fireIcon from "../assets/Fire.gif";
import "./style.css";

// Helpers
const formatBookingDateToYYYYMMDD = (dateStr) => {
  
  if (!dateStr) return "";

  const [year, month, day] = dateStr.split("-");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const MyCalendar = () => {
  const [hijriDateMap, setHijriDateMap] = useState({});
  const [hinduCalendarMap, setHinduCalendarMap] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [marriageDates, setMarriageDates] = useState([]);
  const [selectedReligion, setSelectedReligion] = useState("hindu");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getAllBookings();
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Fetch holidays, marriage dates, and calendar data
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const [holidayRes, marriageRes] = await Promise.all([
          getIndianHolidays(),
          getHotMarriageDates(),
        ]);

        setHolidays(holidayRes.data?.holidays || []);
        setMarriageDates(marriageRes.data?.goodMarriageDates || []);

        if (selectedReligion === "muslim") {
          const hijriRes = await getHijriCalendar();
          const hijriData = hijriRes.data?.hijriCalendar || [];
          const hijriMap = {};
          hijriData.forEach((item) => {
            const [d, m, y] = item.gregorian.split("-");
            hijriMap[`${y}-${m}-${d}`] = item;
          });
          setHijriDateMap(hijriMap);
          setHinduCalendarMap({});
        } else if (selectedReligion === "hindu") {
          const hinduRes = await getHinduCalendar();
          const hinduData = hinduRes.data?.calendar || [];
          const hinduMap = {};
          hinduData.forEach((item) => {
            hinduMap[item.date] = item.kannada;
          });
          setHinduCalendarMap(hinduMap);
          setHijriDateMap({});
        } else {
          setHijriDateMap({});
          setHinduCalendarMap({});
        }
      } catch (err) {
        console.error("Failed to fetch calendar data:", err);
      }
    };

    fetchCalendarData();
  }, [selectedReligion]);

  // Map of bookings by date
  const bookingMap = useMemo(() => {
    const map = {};
    bookings.forEach((booking) => {
      console.log("-->",booking.date)
      const fDate = formatBookingDateToYYYYMMDD(booking.date);
      map[fDate] = booking;
    });
    return map;
  }, [bookings]);

  console.log(bookingMap)

  const holidayDates = useMemo(() => new Set(holidays.map((h) => h.date)), [holidays]);
  const hotMarriageDateSet = useMemo(() => new Set(marriageDates.map((m) => m.date)), [marriageDates]);

  const allEvents = useMemo(
    () =>
      holidays.map((h) => ({
        title: h.name,
        date: h.date,
        backgroundColor: "#ffe6e6",
        textColor: "#000",
        className: "holiday-event",
      })),
    [holidays]
  );

  if (loading) return <Typography>Loading calendar...</Typography>;

  return (
    <Box>
      {/* Religion Selector */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        mb={2}
        gap={2}
      >
        <FormControl component="fieldset">
          <FormLabel component="legend">Select Religion</FormLabel>
          <RadioGroup
            row
            name="religion"
            value={selectedReligion}
            onChange={(e) => setSelectedReligion(e.target.value)}
          >
            <FormControlLabel
              value="hindu"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={12} height={12} bgcolor="orange" borderRadius="2px" />
                  Hindu
                </Box>
              }
            />
            <FormControlLabel
              value="muslim"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={12} height={12} bgcolor="green" borderRadius="2px" />
                  Muslim
                </Box>
              }
            />
            <FormControlLabel
              value="other"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={12} height={12} bgcolor="skyblue" borderRadius="2px" />
                  Other
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Calendar */}
      <FullCalendar
        key={`${selectedReligion}-${Object.keys(hijriDateMap).length}-${
          Object.keys(hinduCalendarMap).length
        }-${holidays.length}-${marriageDates.length}`}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={allEvents}
        height="auto"
        dateClick={(info) => {
          const clickedDate = formatDateToYYYYMMDD(info.date);
          const booking = bookingMap[clickedDate];
          if (booking) {
            setSelectedBooking({ ...booking, date: clickedDate });
            setBookingModalOpen(true);
          }
        }}
        dayCellDidMount={(info) => {
          const localDate = formatDateToYYYYMMDD(info.date);
          const dateEl = info.el.querySelector(".fc-daygrid-day-number");

          info.el.style.position = "relative";

          if (holidayDates.has(localDate)) {
            info.el.style.backgroundColor = "#ffe6e6";
          }

          const booking = bookingMap[localDate];
          if (booking) {
            if (booking.religion === "Hindu" || booking.religion === "hindu") {
              info.el.style.backgroundColor = "orange";
              info.el.style.color = "white";
            } else if (booking.religion === "Muslim" || booking.religion === "muslim") {
              info.el.style.backgroundColor = "green";
              info.el.style.color = "white";
            } else {
              info.el.style.backgroundColor = "skyblue";
              info.el.style.color = "black";
            }
          }

          if (selectedReligion === "muslim" && hijriDateMap[localDate] && dateEl) {
            const hijri = hijriDateMap[localDate];
            const span = document.createElement("span");
            span.className = "hijri-inline";
            span.innerText = ` (${hijri.hijri_day}-${hijri.month_en})`;
            dateEl.appendChild(span);
          }

          if (selectedReligion === "hindu" && hinduCalendarMap[localDate]) {
            const hindu = hinduCalendarMap[localDate];
            const topLeft = document.createElement("div");
            topLeft.className = "hindu-info-top-left";
            topLeft.style.position = "absolute";
            topLeft.style.top = "2px";
            topLeft.style.left = "2px";
            topLeft.style.fontSize = "10px";
            topLeft.style.zIndex = "2";
            topLeft.style.pointerEvents = "none";
            topLeft.innerText = `${hindu["ತಿಥಿ"]} - ${hindu["ಪಾಕ್ಷಿಕ"]} - ${hindu["ಮಾಸ"]}`;
            info.el.appendChild(topLeft);
          }

          if (hotMarriageDateSet.has(localDate)) {
            const img = document.createElement("img");
            img.src = fireIcon;
            img.alt = "Hot Marriage Date";
            img.className = "marriage-gif";
            info.el.appendChild(img);
          }
        }}
      />

      {/* Booking Details Dialog */}
      <Dialog
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
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
          <Button onClick={() => setBookingModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCalendar;
