import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getAllBookings } from "../services/api"; // import your API call

const expenseTypes = ["Salaried Paid", "Repair", "Loan Payment", "Purchase", "Borrower Payment", "Other"];

const FinancePage = () => {
  // States
  const [expenses, setExpenses] = useState([
    {
      description: "Repaired stage lights",
      type: "Repair",
      amount: 3000,
      date: "2025-07-15",
    },
    {
      description: "Paid EMI for wedding loan",
      type: "Loan Payment",
      amount: 10000,
      date: "2025-07-25",
    },
    {
      description: "Bought sound system",
      type: "Purchase",
      amount: 25000,
      date: "2025-07-10",
    },
  ]);

  const [bookings, setBookings] = useState([]); // initially empty

  const [newExpense, setNewExpense] = useState({
    description: "",
    type: "",
    amount: "",
    date: "",
    images: [],
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getAllBookings();
        setBookings(data?.data?.bookings); // set the bookings state with API data
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  // Search/filter/sort/pagination states for Expenses
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseFilterType, setExpenseFilterType] = useState("");
  const [expenseSortBy, setExpenseSortBy] = useState("date");
  const [expenseSortDirection, setExpenseSortDirection] = useState("desc");
  const [expensePage, setExpensePage] = useState(0);
  const [expenseRowsPerPage, setExpenseRowsPerPage] = useState(5);

  // Search/sort/pagination states for Bookings
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingSortBy, setBookingSortBy] = useState("name");
  const [bookingSortDirection, setBookingSortDirection] = useState("asc");
  const [bookingPage, setBookingPage] = useState(0);
  const [bookingRowsPerPage, setBookingRowsPerPage] = useState(5);

  // Sorting helper function
  const sortData = (array = [], orderBy, orderDir) => {
    if (!Array.isArray(array)) return []; // return empty array if not an array
  
    return [...array].sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];
  
      if (typeof aVal === "string" && !isNaN(Number(aVal))) aVal = Number(aVal);
      if (typeof bVal === "string" && !isNaN(Number(bVal))) bVal = Number(bVal);
  
      if (aVal < bVal) return orderDir === "asc" ? -1 : 1;
      if (aVal > bVal) return orderDir === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Filter, search & sort expenses
  const filteredSortedExpenses = useMemo(() => {
    let filtered = expenses;

    // Filter by type
    if (expenseFilterType) {
      filtered = filtered.filter((e) => e.type === expenseFilterType);
    }

    // Search by description or date (case-insensitive)
    if (expenseSearch.trim()) {
      filtered = filtered.filter(
        (e) =>
          e.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
          e.date.includes(expenseSearch)
      );
    }

    // Sort
    filtered = sortData(filtered, expenseSortBy, expenseSortDirection);

    return filtered;
  }, [
    expenses,
    expenseFilterType,
    expenseSearch,
    expenseSortBy,
    expenseSortDirection,
  ]);

  // Filter, search & sort bookings
  const filteredSortedBookings = useMemo(() => {
    let filtered = bookings;

    // Search by name
    if (bookingSearch.trim()) {
      filtered = filtered.filter((b) =>
        b.name.toLowerCase().includes(bookingSearch.toLowerCase())
      );
    }

    // Sort
    filtered = sortData(filtered, bookingSortBy, bookingSortDirection);

    return filtered;
  }, [bookings, bookingSearch, bookingSortBy, bookingSortDirection]);

  // Pagination handlers for expenses
  const handleExpenseChangePage = (event, newPage) => setExpensePage(newPage);
  const handleExpenseChangeRowsPerPage = (event) => {
    setExpenseRowsPerPage(parseInt(event.target.value, 10));
    setExpensePage(0);
  };

  // Pagination handlers for bookings
  const handleBookingChangePage = (event, newPage) => setBookingPage(newPage);
  const handleBookingChangeRowsPerPage = (event) => {
    setBookingRowsPerPage(parseInt(event.target.value, 10));
    setBookingPage(0);
  };

  // Sort request handler for expenses
  const handleExpenseRequestSort = (property) => {
    const isAsc = expenseSortBy === property && expenseSortDirection === "asc";
    setExpenseSortDirection(isAsc ? "desc" : "asc");
    setExpenseSortBy(property);
  };

  // Sort request handler for bookings
  const handleBookingRequestSort = (property) => {
    const isAsc = bookingSortBy === property && bookingSortDirection === "asc";
    setBookingSortDirection(isAsc ? "desc" : "asc");
    setBookingSortBy(property);
  };

  // Add new expense
  const handleAddExpense = () => {
    const { description, type, amount, date, images } = newExpense;
    if (!description || !type || !amount || !date) {
      alert("Please fill all fields");
      return;
    }
  
    setExpenses([...expenses, { description, type, amount, date, images }]);
  
    // Reset state
    setNewExpense({
      description: "",
      type: "",
      amount: "",
      date: "",
      images: [],
    });
    setDialogOpen(false);
  };
console.log(bookings)
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        💰 Finance Dashboard
      </Typography>

      {/* Bookings Section */}
      <Paper elevation={3} sx={{ mb: 4, p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6">Booking Financials</Typography>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search by name"
            value={bookingSearch}
            onChange={(e) => setBookingSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["name", "totalAmount", "advance", "balance"].map((headCell) => (
                <TableCell key={headCell}>
                  <TableSortLabel
                    active={bookingSortBy === headCell}
                    direction={
                      bookingSortBy === headCell ? bookingSortDirection : "asc"
                    }
                    onClick={() => handleBookingRequestSort(headCell)}
                  >
                    {headCell === "name"
                      ? "Name"
                      : headCell === "totalAmount"
                      ? "Total Bill"
                      : headCell === "advance"
                      ? "Advance Received"
                      : "Balance Paid"}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSortedBookings
              .slice(
                bookingPage * bookingRowsPerPage,
                bookingPage * bookingRowsPerPage + bookingRowsPerPage
              )
              .map((b, index) => (
                <TableRow key={index}>
                  <TableCell>{b.name}</TableCell>
                  <TableCell>₹ {b.totalCost}</TableCell>
                  <TableCell>₹ {b.advance}</TableCell>
                  <TableCell>₹ {b.balance}</TableCell>
                </TableRow>
              ))}
            {filteredSortedBookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredSortedBookings.length}
          page={bookingPage}
          onPageChange={handleBookingChangePage}
          rowsPerPage={bookingRowsPerPage}
          onRowsPerPageChange={handleBookingChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Expenses Section */}
      <Paper elevation={3} sx={{ mb: 4, p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h6">Expense History</Typography>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search description or date"
            value={expenseSearch}
            onChange={(e) => setExpenseSearch(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              label="Filter by Type"
              value={expenseFilterType}
              onChange={(e) => setExpenseFilterType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {expenseTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            + Add Expense
          </Button>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              {["description", "type", "amount", "date"].map((headCell) => (
                <TableCell key={headCell}>
                  <TableSortLabel
                    active={expenseSortBy === headCell}
                    direction={
                      expenseSortBy === headCell ? expenseSortDirection : "asc"
                    }
                    onClick={() => handleExpenseRequestSort(headCell)}
                  >
                    {headCell.charAt(0).toUpperCase() + headCell.slice(1)}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSortedExpenses
              .slice(
                expensePage * expenseRowsPerPage,
                expensePage * expenseRowsPerPage + expenseRowsPerPage
              )
              .map((e, index) => (
                <TableRow key={index}>
                  <TableCell>{e.description}</TableCell>
                  <TableCell>{e.type}</TableCell>
                  <TableCell>₹ {e.amount}</TableCell>
                  <TableCell>{e.date}</TableCell>
                </TableRow>
              ))}
            {filteredSortedExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No expenses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredSortedExpenses.length}
          page={expensePage}
          onPageChange={handleExpenseChangePage}
          rowsPerPage={expenseRowsPerPage}
          onRowsPerPageChange={handleExpenseChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Add Expense Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            value={newExpense.description}
            onChange={(e) =>
              setNewExpense({ ...newExpense, description: e.target.value })
            }
          />
          <TextField
            fullWidth
            select
            label="Type"
            margin="normal"
            value={newExpense.type}
            onChange={(e) =>
              setNewExpense({ ...newExpense, type: e.target.value })
            }
          >
            {expenseTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            margin="normal"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newExpense.date}
            onChange={(e) =>
              setNewExpense({ ...newExpense, date: e.target.value })
            }
          />
        </DialogContent>
        <TextField
          fullWidth
          type="file"
          inputProps={{ multiple: true, accept: "image/*" }}
          margin="normal"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            setNewExpense((prev) => ({
              ...prev,
              images: files,
            }));
          }}
        />
        <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
          {newExpense.images?.map((img, idx) => (
            <Box key={idx}>
              <img
                src={URL.createObjectURL(img)}
                alt={`upload-${idx}`}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            </Box>
          ))}
        </Box>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddExpense}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancePage;
