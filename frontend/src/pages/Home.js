import React, { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { bookings, expenses, RELIGION_COLORS } from "../components/data";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import EventIcon from "@mui/icons-material/Event";
import TodayIcon from "@mui/icons-material/Today";
import MoneyIcon from "@mui/icons-material/Money";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SavingsIcon from '@mui/icons-material/Savings';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA47BC"];

const HomeDashboard = () => {
  const [filter, setFilter] = useState("all");
  const now = new Date();

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filterByDate = (data) => {
    return data.filter(({ date }) => {
      const d = new Date(date);
      if (filter === "monthly") {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      }
      if (filter === "yearly") {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredBookings = useMemo(() => filterByDate(bookings), [bookings, filter]);
  const filteredExpenses = useMemo(() => filterByDate(expenses), [expenses, filter]);

  // KPIs
  const totalBookings = filteredBookings.length;
  const totalBookingDays = useMemo(
    () => filteredBookings.reduce((acc, b) => acc + Number(b.days || 0), 0),
    [filteredBookings]
  );
  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0),
    [filteredExpenses]
  );
  const totalRevenue = useMemo(
    () => filteredBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0),
    [filteredBookings]
  );

  // Charts
  const categoriesByReligion = useMemo(() => {
    const result = {};
    filteredBookings.forEach(({ religion }) => {
      const key = religion || "Others";
      result[key] = (result[key] || 0) + 1;
    });
    return Object.entries(result).map(([religion, count]) => ({
      name: religion,
      value: count,
      fill: RELIGION_COLORS[religion] || "#BDBDBD",
    }));
  }, [filteredBookings]);

  const categoriesByEventType = useMemo(() => {
    const result = {};
    filteredBookings.forEach(({ event_type }) => {
      result[event_type] = (result[event_type] || 0) + 1;
    });
    return Object.entries(result).map(([event_type, count]) => ({
      name: event_type,
      value: count,
    }));
  }, [filteredBookings]);

  const expensesByCategory = useMemo(() => {
    const result = {};
    filteredExpenses.forEach(({ category, amount }) => {
      result[category] = (result[category] || 0) + Number(amount || 0);
    });
    return Object.entries(result).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  }, [filteredExpenses]);

  const totalProfit = useMemo(() => {
    return filteredBookings.reduce(
      (acc, b) => acc + (b.profit || 0),
      0
    );
  }, [filteredBookings]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      {/* Filter Dropdown */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small">
          <InputLabel>Filter</InputLabel>
          <Select value={filter} onChange={handleFilterChange} label="Filter">
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="monthly">This Month</MenuItem>
            <MenuItem value="yearly">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2}>
        {[{
          title: "Total Bookings",
          value: totalBookings,
          icon: <EventIcon color="primary" sx={{ fontSize: 40 }} />,
          bgcolor: "#e3f2fd"
        }, {
          title: "Total Booking Days",
          value: totalBookingDays,
          icon: <TodayIcon color="secondary" sx={{ fontSize: 40 }} />,
          bgcolor: "#fce4ec"
        }, {
          title: "Total Expenses",
          value: `₹${totalExpenses.toLocaleString()}`,
          icon: <MoneyIcon sx={{ color: "#ff9800", fontSize: 40 }} />,
          bgcolor: "#fff3e0"
        }, {
          title: "Total Revenue",
          value: `₹${totalRevenue.toLocaleString()}`,
          icon: <TrendingUpIcon sx={{ color: "#4caf50", fontSize: 40 }} />,
          bgcolor: "#e8f5e9"
        },
        {
          title: "Total Profit",
          value: `₹${totalProfit.toLocaleString()}`,
          icon: <SavingsIcon sx={{ color: "#f5bc42", fontSize: 40 }} />,
          bgcolor: "#42c5f5",
        },
      ].map((kpi, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Paper sx={{ p: 2, bgcolor: kpi.bgcolor, display: "flex", alignItems: "center", gap: 2 }}>
              {kpi.icon}
              <Box>
                <Typography variant="subtitle1" color="textSecondary">
                  {kpi.title}
                </Typography>
                <Typography variant="h5">{kpi.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bookings by Religion
            </Typography>
            <PieChart width={300} height={300}>
              <Pie
                data={categoriesByReligion}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoriesByReligion.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ReTooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bookings by Event Type
            </Typography>
            <BarChart
              width={300}
              height={300}
              data={categoriesByEventType}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <PieChart width={300} height={300}>
              <Pie
                data={expensesByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ReTooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeDashboard;
