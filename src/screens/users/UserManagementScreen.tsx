import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Paper,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  IconButton,
  TablePagination,
  InputAdornment,
  useTheme,
  Button,
} from '@mui/material';
import { useUsers } from '../../hooks/useUsers';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { UserApi } from '../../api/user/UserApi';
import { tokens } from '../../theme/theme';

const UserManagementScreen = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const { users, loading, error } = useUsers(page, size);

  // Dialog state for toggle confirmation
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserCurrentStatus, setSelectedUserCurrentStatus] = useState(false);

  // Handle search
  const filteredUsers = users.filter((user) =>
    user.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle toggle active/inactive
  const handleToggleClick = (userId: number, userName: string, currentStatus: boolean) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserCurrentStatus(currentStatus);
    setToggleDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedUserId) return;

    try {
      await UserApi.toggleUserActive(selectedUserId);
      setToggleDialogOpen(false);
      // Reload page to refresh user list
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Không thể cập nhật trạng thái người dùng');
    }
  };

  const getStatusChip = (isActive: boolean) => {
    if (isActive) {
      return <Chip label="✓ Hoạt động" color="success" size="small" variant="filled" />;
    }
    return <Chip label="✗ Vô hiệu" color="error" size="small" variant="outlined" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          👤 Quản lý người dùng
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Tổng: {users.length} người dùng
        </Typography>
      </Stack>

      {/* Search Box */}
      <Paper sx={{ mb: 3, p: 2, bgcolor: colors.primary[400] }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.primary[100] }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: colors.primary[100],
              '& fieldset': {
                borderColor: colors.primary[200],
              },
              '&:hover fieldset': {
                borderColor: colors.primary[100],
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.blueAccent[500],
              },
            },
            '& .MuiOutlinedInput-input::placeholder': {
              color: colors.primary[200],
              opacity: 0.7,
            },
          }}
        />
      </Paper>

      {/* Users Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Lỗi: {String(error)}</Typography>
      ) : filteredUsers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: colors.primary[400] }}>
          <Typography color="textSecondary">Không tìm thấy người dùng nào</Typography>
        </Paper>
      ) : (
        <Paper sx={{ bgcolor: colors.primary[400], borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: colors.greenAccent[700] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Tên</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Ngày tạo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? colors.primary[400] : colors.primary[500],
                    '&:hover': {
                      backgroundColor: colors.primary[300],
                    },
                  }}
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{user.adminName}</TableCell>
                  <TableCell>{user.adminEmail}</TableCell>
                  <TableCell>{getStatusChip(user.active ?? true)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleToggleClick(Number(user.id), user.adminName, user.active ?? true)
                      }
                      title={user.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      sx={{
                        color: user.active ? '#4caf50' : '#ff9800',
                      }}
                    >
                      {user.active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={users.length}
            rowsPerPage={size}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              bgcolor: colors.primary[400],
              color: colors.primary[100],
              '& .MuiIconButton-root': {
                color: colors.primary[100],
              },
            }}
          />
        </Paper>
      )}

      {/* Toggle Status Confirmation Dialog */}
      <Dialog open={toggleDialogOpen} onClose={() => setToggleDialogOpen(false)}>
        <DialogTitle sx={{ color: colors.blueAccent[400], fontWeight: 600 }}>
          🔄 Cập nhật trạng thái người dùng
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn {selectedUserCurrentStatus ? 'vô hiệu hóa' : 'kích hoạt'} người dùng{' '}
            <strong>{selectedUserName}</strong> không?
            <br />
            <span style={{ color: colors.blueAccent[400], marginTop: '8px', display: 'block' }}>
              Trạng thái sẽ chuyển từ "{selectedUserCurrentStatus ? 'Hoạt động' : 'Vô hiệu'}" sang "
              {selectedUserCurrentStatus ? 'Vô hiệu' : 'Hoạt động'}"
            </span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleDialogOpen(false)} color="primary">
            Hủy
          </Button>
          <Button onClick={handleConfirmToggle} color="success" variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementScreen;
