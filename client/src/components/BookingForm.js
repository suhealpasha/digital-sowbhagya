import React, { useState } from 'react';
import axios from 'axios';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    purpose: '',
    contact: ''
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/bookings', formData);
      alert('Booking successful!');
      setFormData({ name: '', date: '', purpose: '', contact: '' });
    } catch (err) {
      alert('Error submitting booking');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} value={formData.name} required />
      <input name="date" type="date" onChange={handleChange} value={formData.date} required />
      <input name="purpose" placeholder="Purpose" onChange={handleChange} value={formData.purpose} required />
      <input name="contact" placeholder="Contact" onChange={handleChange} value={formData.contact} required />
      <button type="submit">Book Now</button>
    </form>
  );
};

export default BookingForm;
