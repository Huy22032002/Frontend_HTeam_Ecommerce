import { Box } from "@mui/material";
// import CustomerSidebar from "./CustomerSidebar";
import { Outlet } from "react-router-dom";
import CustomerSidebarResponsive from "./CustomerSidebarResponsive";

const CustomerLayout = () => {
  return (
    <Box sx={{ display: "flex", gap: 6, p: 4, maxWidth: 1200, mx: "auto" }}>
      <CustomerSidebarResponsive />
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default CustomerLayout;
