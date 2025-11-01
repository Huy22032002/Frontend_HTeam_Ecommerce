import { Box, Typography, TextField, Button } from "@mui/material";

const Info = () => {
  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Thông tin tài khoản
      </Typography>
      <TextField label="Họ và tên" fullWidth sx={{ mb: 2 }} />
      <TextField label="Email" fullWidth sx={{ mb: 2 }} />
      <TextField label="Số điện thoại" fullWidth sx={{ mb: 2 }} />
      <Button variant="contained">Cập nhật</Button>
    </Box>
  );
};
export default Info;
