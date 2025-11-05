import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const CustomerProfile: React.FC = () => {
  // Placeholder customer profile screen. Replace with real implementation as needed.
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Thông tin cá nhân
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Đây là trang hồ sơ khách hàng. Nội dung chi tiết sẽ được triển khai sau.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CustomerProfile;
