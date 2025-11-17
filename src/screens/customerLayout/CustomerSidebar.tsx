import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LogoutIcon from "@mui/icons-material/Logout";
import { useDispatch } from "react-redux";
import { logout } from "../../store/customerSlice";

const menu = [
  {
    label: "Thông tin tài khoản",
    to: "account-info",
    icon: <PersonOutlineIcon />,
  },
  {
    label: "Lịch sử đơn hàng",
    to: "orders-history",
    icon: <Inventory2OutlinedIcon />,
  },
  { label: "Sổ địa chỉ", to: "addresses", icon: <LocationOnOutlinedIcon /> },
  {
    label: "Đánh giá của tôi",
    to: "reviews",
    icon: <RateReviewIcon />,
  },
  {
    label: "Voucher của tôi",
    to: "vouchers",
    icon: <CardGiftcardIcon />,
  },
];

const CustomerSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <Box
      sx={{
        width: 260,
        borderRight: "1px solid #e0e0e0",
        pr: 1,
      }}
    >
      <Typography sx={{ fontWeight: 600, mb: 2, fontSize: "1.15rem" }}>
        Tài khoản của tôi
      </Typography>

      <List sx={{ py: 0 }}>
        {menu.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            sx={{
              borderRadius: "8px",
              mb: 0.5,
              "&.active": {
                backgroundColor: "#1976d2",
                color: "white",
                "& .MuiListItemIcon-root": {
                  color: "white",
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}{" "}
        {/* Divider ngăn cách menu và logout */}
        <Divider sx={{ my: 1 }} />
        {/* Logout */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: "8px",
            mb: 0.5,
            color: "#d32f2f",
            "& .MuiListItemIcon-root": { color: "#d32f2f" },
            "&:hover": {
              backgroundColor: "rgba(211,47,47,0.1)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default CustomerSidebar;
