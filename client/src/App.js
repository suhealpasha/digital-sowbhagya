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
import LoginPage from "./pages/Login"
import { BookingProvider } from "./context/BookingContext";
import ProtectedRoute from "./routes/ProtectedRoute"; // create this
import LoginRedirect from "./routes/LoginRedirect";   // create this

function App() {
  return (
    <Router>
      <BookingProvider>
        <CssBaseline />
        <Routes>
          <Route
            path="/login"
            element={
              <LoginRedirect>
                <LoginPage />
              </LoginRedirect>
            }
          />

          {/* All protected routes */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Box sx={{ display: "flex" }}>
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
              </ProtectedRoute>
            }
          />
        </Routes>
      </BookingProvider>
    </Router>
  );
}

export default App;
