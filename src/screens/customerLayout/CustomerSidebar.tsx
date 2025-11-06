import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

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
];

const CustomerSidebar = () => {
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
        ))}
      </List>
    </Box>
  );
};

export default CustomerSidebar;
