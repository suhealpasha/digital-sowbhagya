import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useMediaQuery,
  Box,
} from "@mui/material";
import {
  Home,
  EventNote,
  AddCircle,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import DvrIcon from "@mui/icons-material/Dvr";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useBooking } from "../context/BookingContext";

const drawerWidth = 240;

const SideBar = () => {
  const { startNewBooking } = useBooking();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const handleItemClick = (callback) => {
    if (isMobile) {
      setMobileOpen(false); // Close drawer on mobile
    }
    if (typeof callback === "function") {
      callback(); // Run optional callback like startNewBooking
    }
  };

  const drawerContent = (
    <Box>
      <Box
        sx={{
          height: 64,
          bgcolor: "#1976d2",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "1.2rem",
          letterSpacing: 1,
          boxShadow: 1,
        }}
      >
        Digital Sowbhagya
      </Box>

      <Divider />

      <Box sx={{ pt: 2 }}>
        <List>
          <ListItem button component={Link} to="/" onClick={() => handleItemClick()}>
            <ListItemIcon><Home /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          <ListItem button component={Link} to="/calendar" onClick={() => handleItemClick()}>
            <ListItemIcon><EventNote /></ListItemIcon>
            <ListItemText primary="Calendar" />
          </ListItem>

          <ListItem button component={Link} to="/new-booking" onClick={() => handleItemClick(startNewBooking)}>
            <ListItemIcon><AddCircle /></ListItemIcon>
            <ListItemText primary="New Booking" />
          </ListItem>

          <ListItem button component={Link} to="/booking-list" onClick={() => handleItemClick()}>
            <ListItemIcon><DvrIcon /></ListItemIcon>
            <ListItemText primary="All Bookings" />
          </ListItem>

          <ListItem button component={Link} to="/finance" onClick={() => handleItemClick()}>
            <ListItemIcon><CurrencyRupeeIcon /></ListItemIcon>
            <ListItemText primary="Finance" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleDrawer}
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 1300,
            color: "#fff",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={!isMobile || mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default SideBar;
