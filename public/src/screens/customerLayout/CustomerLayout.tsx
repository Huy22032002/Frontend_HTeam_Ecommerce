import { Box } from "@mui/material";
import CustomerSidebar from "./CustomerSidebar";
import { Outlet } from "react-router-dom";

const CustomerLayout = () => {
  return (
    <Box sx={{ display: "flex", gap: 6, p: 4, maxWidth: 1200, mx: "auto" }}>
      <CustomerSidebar />
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default CustomerLayout;
