// api.js
import axios from "axios";

process.env.NODE_ENV === "production"
? "https://digital-sowbhagya.onrender.com/" // Relative path — works when frontend and backend are on same domain
: "http://localhost:5000"; 

// Get token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to add Authorization header
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && !config.url.includes("/auth/login")) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ========== API FUNCTIONS ==========

// Auth
export const submitLogin = (data) =>
  api.post('/api/auth/login', data);

// Bookings
export const updateBooking = (id, data) =>
  api.put(`/api/bookings/update-booking/${id}`, data);

export const createBooking = (data) =>
  api.post('/api/bookings/add-new-booking', data);

export const getBookings = (params) =>
  api.get('/api/bookings/bookings-list', { params });

export const getAllBookings = () =>
  api.get('/api/bookings/bookings-all-list');

export const deleteBooking = (id) =>
  api.delete(`/api/bookings/delete/${id}`);

// Calendars & Holidays
export const getHijriCalendar = () =>
  api.get('/api/hijri-calendar');

export const getHinduCalendar = () =>
  api.get('/api/hindu-calendar');

export const getIndianHolidays = () =>
  api.get('/api/indian-holidays');

export const getHotMarriageDates = () =>
  api.get('/api/marriage-dates');

// Expenses
export const getAllExpenses = () =>
  api.get('/api/expenses/expenses-all-list');

export const addNewExpense = (formData) =>
  api.post('/api/expenses/add-new-expense', formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const deleteExpense = (id) =>
  api.delete(`/api/expenses/delete-expense/${id}`);
