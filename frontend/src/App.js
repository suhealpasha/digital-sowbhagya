import { Box, CssBaseline } from "@mui/material";
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";
import Bookings from "./pages/Bookings";
import MyCalendar from './pages/Calendar';
import MyListCalendar from "./pages/CalendarList";
import Home from "./pages/Home";
import NewBooking from "./pages/NewBooking";
import FinancePage from "./pages/Finance";
import { BookingProvider } from "./context/BookingContext";

function App() {
  return (
    <Router>
      <BookingProvider>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <TopBar />
        <SideBar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<MyCalendar />} />
            <Route path="/list-calendar" element={<MyListCalendar />} />
            <Route path="/new-booking" element={<NewBooking />} />
            <Route path="/booking-list" element={<Bookings />} />
            <Route path="/finance" element={<FinancePage />} />
          </Routes>
        </Box>
      </Box>
      </BookingProvider>
    </Router>
  );
}

export default App; 