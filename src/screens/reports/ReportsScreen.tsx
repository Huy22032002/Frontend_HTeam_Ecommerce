import { Box, Typography } from '@mui/material';
import { CmsLayout } from '../../components/cms/CmsLayout';

const ReportsScreen = () => {
  return (
    <CmsLayout>
      <Typography variant="h4" fontWeight={600} mb={2}>Thống kê báo cáo</Typography>
      <Box color="text.secondary" fontSize={14}>Placeholder cho biểu đồ / bảng số liệu. Thêm chart libraries (Nivo/Recharts) sau.</Box>
    </CmsLayout>
  );
};

export default ReportsScreen;
