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
    console.log(url)
    window.open(url, "_blank", "noopener,noreferrer");
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
