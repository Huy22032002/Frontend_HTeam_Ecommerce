import { Drawer, IconButton, useMediaQuery, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import CustomerSidebar from "./CustomerSidebar";

const CustomerSidebarResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  // Desktop → render thẳng
  if (!isMobile) {
    return <CustomerSidebar />;
  }

  // Mobile → Drawer
  return (
    <>
      <IconButton onClick={() => setOpen(true)} sx={{ mb: 1 }}>
        <MenuIcon />
      </IconButton>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, p: 2 }}>
          <CustomerSidebar />
        </Box>
      </Drawer>
    </>
  );
};

export default CustomerSidebarResponsive;
