import { Box, Typography } from '@mui/material';

const ActivityLogScreen = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={2}>Lịch sử hoạt động</Typography>
      <Box color="text.secondary" fontSize={14}>Chưa có dữ liệu thật. Thay thế bằng bảng log hoặc timeline khi tích hợp API.</Box>
    </Box>
  );
};

export default ActivityLogScreen;
