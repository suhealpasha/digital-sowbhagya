import React, { useState, useEffect } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import ClearIcon from "@mui/icons-material/Clear";
import CircularProgress from "@mui/material/CircularProgress";
import { useDebounce } from "use-debounce";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  TableSortLabel,
  TextField,
  Pagination,
  Box,
  Grid,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { getBookings, deleteBooking } from "../services/api";

const BookingList = ({ onEdit, onDownloadBill }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchFields, setSearchFields] = useState({
    search: "",
  });
  const [debouncedSearch] = useDebounce(searchFields.search, 500);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // static limit
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Search fields
  const fetchBookings = async () => {
    setIsLoading(true); // Start loading
    try {
      const res = await getBookings({
        page,
        limit,
        sortBy,
        sortOrder,
        search: debouncedSearch,
      });
      setBookings(res.data.bookings);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, limit, sortBy, sortOrder, debouncedSearch]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;

    try {
      await deleteBooking(bookingToDelete._id);
      toast.success("Booking deleted successfully");
      setIsDeleteDialogOpen(false);
      setBookingToDelete(null);
      fetchBookings();
    } catch (error) {
      toast.error("Failed to delete booking");
      console.error("Delete error:", error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const formatLabel = (key) => {
    // Split camelCase and snake_case, then capitalize words nicely
    const withSpaces = key
      // Convert camelCase to words separated by space
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Replace underscores with spaces
      .replace(/_/g, " ")
      .toLowerCase();

    // Capitalize each word (including acronyms like GST)
    return withSpaces
      .split(" ")
      .map((word) => {
        // Handle common acronyms you want fully uppercase
        const acronyms = ["gst", "id", "url"];
        if (acronyms.includes(word)) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  return (
    <Box sx={{ width: "100%", mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search by Name / Phone / Event / Religion"
          value={searchFields.search || ""}
          onChange={(e) =>
            setSearchFields((prev) => ({
              ...prev,
              search: e.target.value,
            }))
          }
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchFields.search ? (
                  <IconButton
                    size="small"
                    onClick={() => setSearchFields({ search: "" })}
                  >
                    <ClearIcon />
                  </IconButton>
                ) : null}
                {isLoading && <CircularProgress size={20} sx={{ ml: 1 }} />}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {isLoading ? (
        <Typography variant="h6" align="center" sx={{ mt: 3 }}>
          Loading bookings...
        </Typography>
      ) : bookings.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ mt: 3 }}>
          No bookings found.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    { key: "name", label: "Name" },
                    { key: "phone", label: "Phone" },
                    { key: "event_type", label: "Event Type" },
                    { key: "religion", label: "Religion" },
                    { key: "date", label: "Event Date" },
                  ].map(({ key, label }) => (
                    <TableCell key={key}>
                      <TableSortLabel
                        active={sortBy === key}
                        direction={sortBy === key ? sortOrder : "asc"}
                        onClick={() => handleSort(key)}
                      >
                        {label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Advance</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    {/* existing cells */}
                    <TableCell
                      sx={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsDialogOpen(true);
                      }}
                    >
                      {booking.name}
                    </TableCell>
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell>{booking.event_type}</TableCell>
                    <TableCell>{booking.religion}</TableCell>
                    <TableCell>
                      {new Date(booking.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      ₹{booking.totalCost?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      ₹{booking.advance?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      ₹
                      {(booking.balance !== undefined
                        ? booking.balance
                        : (booking.totalCost || 0) - (booking.advance || 0)
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell align="center">
                      {/* existing actions */}
                      <Tooltip title="Edit Booking">
                        <IconButton onClick={() => onEdit(booking)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Booking">
                        <IconButton
                          onClick={() => {
                            setBookingToDelete(booking);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                      {booking.gstBillUrl && (
                        <Tooltip title="Download Bill">
                          <IconButton
                            onClick={() =>
                              onDownloadBill(booking.gstBillUrl)
                            }
                            color="success"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
            />
          </Box>
        </>
      )}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent dividers>
          {selectedBooking ? (
            <List dense>
              {Object.entries(selectedBooking).map(([key, value]) => {
                let displayValue;

                if (typeof value === "boolean") {
                  displayValue = value ? "Yes" : "No";
                } else if (Array.isArray(value) || typeof value === "object") {
                  displayValue = JSON.stringify(value, null, 2);
                } else {
                  displayValue = value;
                }

                // Format date strings
                if (["date", "createdAt", "updatedAt"].includes(key) && value) {
                  displayValue = new Date(value).toLocaleString();
                }

                return (
                  <ListItem key={key} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={
                        <Typography component="span" fontWeight="bold">
                          {formatLabel(key)}
                        </Typography>
                      }
                      secondary={displayValue}
                      primaryTypographyProps={{ sx: { mb: 0.5 } }}
                      secondaryTypographyProps={{
                        sx: { whiteSpace: "pre-wrap" },
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography>No booking data found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDialogOpen(false)}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete the booking{" "}
            <strong>{bookingToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingList;
