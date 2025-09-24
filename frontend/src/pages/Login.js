import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { submitLogin } from '../services/api';
import { useNavigate } from 'react-router-dom';
import backgroundImage from "../assets/login-bg.png";

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await submitLogin(form);
      const { token, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(user));
      setMessage('Login successful!');
      setMessageType('success');

      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2, // horizontal padding for small screens
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant={isMobile ? "h5" : "h4"}
          align="center"
          sx={{
            fontFamily: 'Inter-Regular',
            color: '#fff',
            mb: 3,
            textShadow: '0px 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          Digital Sowbhagya
        </Typography>

        <Paper
          elevation={4}
          sx={{
            padding: isMobile ? 2 : 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Typography variant="h6" align="center" gutterBottom>
            Login
          </Typography>

          {message && (
            <Alert severity={messageType} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Username"
              name="username"
              fullWidth
              margin="normal"
              value={form.username}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ marginTop: 2, padding: 2 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
