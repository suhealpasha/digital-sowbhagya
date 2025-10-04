import React, { useEffect, useState, useRef } from "react";
import BookingList from "../components/BookingList";
import { getBookings } from "../services/api";
import { toast } from "react-toastify";
import { useBooking } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";

const BookingListContainer = () => {
  const navigate = useNavigate();
  const { setEditBooking } = useBooking();
  const [bookings, setBookings] = useState([]);
  const hasLoaded = useRef(false); // flag to prevent duplicate calls

  useEffect(() => {
    if (!hasLoaded.current) {
      loadBookings();
      hasLoaded.current = true;
    }
  }, []);

  const loadBookings = async () => {
    try {
      const { data } = await getBookings();
      setBookings(data.bookings || data);
    } catch (error) {
      toast.error("Failed to load bookings");
    }
  };

  const handleEdit = (booking) => {
    setEditBooking(booking);
    navigate("/new-booking");
  };
  const handleDownloadBill = (url) => {
    const directDownloadUrl = url.replace("dl=0", "dl=1");
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
    const filename = `Bill_invoice_${timestamp}.pdf`;
    const link = document.createElement("a");
    link.href = directDownloadUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BookingList
      bookings={bookings}
      onEdit={handleEdit}
      onDownloadBill={handleDownloadBill}
    />
  );
};

export default BookingListContainer;
