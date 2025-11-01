import { Outlet, Link, useLocation } from "react-router-dom";
import { Box, List, ListItemButton, ListItemText, Paper } from "@mui/material";

const menuItems = [
  { label: "Thông tin tài khoản", path: "thong-tin-tai-khoan" },
  { label: "Lịch sử đơn hàng", path: "lich-su-don-hang" },
  { label: "Ví voucher", path: "vi-voucher" },
  { label: "Đánh giá & nhận xét", path: "danh-gia-nhan-xet" },
];

export default function CustomerLayout() {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", gap: 4, p: 4, maxWidth: "1400px", mx: "auto" }}>
      {/* LEFT MENU */}
      <Paper sx={{ width: 240 }}>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={location.pathname.endsWith(item.path)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* RIGHT CONTENT */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
