import axios from "axios";

const BASE_URL = "http://localhost:5000";

export const submitLogin = (data) =>
  axios.post(`${BASE_URL}/api/auth/login`, data);

export const updateBooking = (id, data) =>
  axios.put(`${BASE_URL}/api/bookings/update-booking/${id}`, data);

export const createBooking = (data) =>
  axios.post(`${BASE_URL}/api/bookings/add-new-booking`, data);

export const getBookings = (params) =>
  axios.get(`${BASE_URL}/api/bookings/bookings-list`, { params });

export const getAllBookings = (params) =>
  axios.get(`${BASE_URL}/api/bookings/bookings-all-list`);

export const deleteBooking = (id) =>
  axios.delete(`${BASE_URL}/api/bookings/delete/${id}`);

export const getHijriCalendar = () =>
  axios.get(`${BASE_URL}/api/hijri-calendar`);

export const getHinduCalendar = () =>
  axios.get(`${BASE_URL}/api/hindu-calendar`);

export const getIndianHolidays = () =>
  axios.get(`${BASE_URL}/api/indian-holidays`);

export const getHotMarriageDates = () =>
  axios.get(`${BASE_URL}/api/marriage-dates`);

export const getAllExpenses = () =>
  axios.get(`${BASE_URL}/api/expenses/expenses-all-list`);

export const addNewExpense = (formData) =>
  axios.post(`${BASE_URL}/api/expenses/add-new-expense`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteExpense = (id) =>
  axios.delete(`${BASE_URL}/api/expenses/delete-expense/${id}`);
