import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: { marginLeft: theme.spacing(1), width: "auto" },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "100%",
    [theme.breakpoints.up("sm")]: { width: "20ch" },
  },
}));

const TopBar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    // Your logout logic
    alert("Logged out");
    handleClose();
  };

  return (
    <AppBar position="fixed">
    <Toolbar sx={{ justifyContent: "space-between" }}>
  <Typography
    variant="h6"
    noWrap
    component="div"
    sx={{ display: { xs: "none", sm: "block" } }}
  >
    Event Booking
  </Typography>

  <Search sx={{marginLeft: "20px"}}>
    <SearchIconWrapper>
      <SearchIcon />
    </SearchIconWrapper>
    <StyledInputBase placeholder="Search…" />
  </Search>

  <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
    <CalendarMonthIcon sx={{ color: "white", fontSize: 28 }} onClick={() => navigate("/list-calendar")}/>
    <IconButton onClick={handleAvatarClick} size="small">
      <Avatar alt="User" src="/user.jpg" sx={{ width: 28, height: 28 }} />
    </IconButton>
  </Box>

  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
  >
    <MenuItem onClick={handleLogout}>Logout</MenuItem>
  </Menu>
</Toolbar>

    </AppBar>
  );
};

export default TopBar;
