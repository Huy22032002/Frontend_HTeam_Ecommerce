// AccountLayout.tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

const menuItems = [
  { label: "Thông tin tài khoản", path: "/customer/info" },
  { label: "Lịch sử đơn hàng", path: "/customer/orders" },
  { label: "Đổi mật khẩu", path: "/customer/change-password" },
];

export default function CustomerLayout() {
  const location = useLocation();

  return (
    <Box px={20} display="flex" minHeight="100vh">
      {/* Sidebar */}
      <Box width="250px" bgcolor="grey.100" p={2} borderRight="1px solid #ddd">
        <Typography variant="h6" mb={2}>
          Tài khoản
        </Typography>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Content */}
      <Box flex={1} p={3}>
        <Outlet />
      </Box>
    </Box>
  );
}
