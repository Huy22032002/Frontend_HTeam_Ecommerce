import { Box, Typography } from '@mui/material';
import { CmsLayout } from '../../components/cms/CmsLayout';

const UserManagementScreen = () => {
  return (
    <CmsLayout>
      <Typography variant="h4" fontWeight={600} mb={2}>Quản lý người dùng</Typography>
      <Box color="text.secondary" fontSize={14}>Placeholder quản lý user: thêm bảng người dùng, tìm kiếm, phân quyền sau.</Box>
    </CmsLayout>
  );
};

export default UserManagementScreen;
