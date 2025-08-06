import React, { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [editBooking, setEditBooking] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const startNewBooking = () => {
    setEditBooking(null);
    setIsEdit(false);
  };

  const startEditBooking = (booking) => {
    setEditBooking(booking);
    setIsEdit(true);
  };

  return (
    <BookingContext.Provider
      value={{
        editBooking,
        setEditBooking,
        isEdit,
        setIsEdit,
        startNewBooking,
        startEditBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
