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
  Avatar,
} from '@mui/material';
import { useUsers } from '../../hooks/useUsers';
import { useEffect, useState, useRef } from 'react';
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
  const { users: apiUsers, loading, error } = useUsers(page, size);
  const [users, setUsers] = useState(apiUsers);

  // Sync API users with local state
  useEffect(() => {
    setUsers(apiUsers);
  }, [apiUsers]);

  // Dialog state for toggle confirmation
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserCurrentStatus, setSelectedUserCurrentStatus] = useState(false);

  // Dialog state for block confirmation
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedBlockUserId, setSelectedBlockUserId] = useState<number | null>(null);

  // Temp refs for block dialog (to avoid unused setter warnings)
  const blockUserNameRef = useRef('');
  const blockUserStatusRef = useRef(false);

  // Dialog state for create user
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    userName: '',
    name: '',
    emailAddress: '',
    password: '',
    repeatPassword: '',
    active: true,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Handle search
  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      const response = await UserApi.toggleUserActive(selectedUserId);
      setToggleDialogOpen(false);
      
      // Update local state instead of reloading
      const updatedUser = response.data;
      setUsers(prevUsers =>
        prevUsers.map(u =>
          Number(u.id) === selectedUserId
            ? { ...u, active: updatedUser.active }
            : u
        )
      );
      
      console.log(`✅ User ${selectedUserName} status updated to: ${updatedUser.active ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Không thể cập nhật trạng thái người dùng');
    }
  };

  // Handle block user click
  const handleBlockClick = (userId: number, userName: string, currentBlockedStatus: boolean) => {
    setSelectedBlockUserId(userId);
    blockUserNameRef.current = userName;
    blockUserStatusRef.current = currentBlockedStatus;
    setBlockDialogOpen(true);
  };

  // Handle confirm block/unblock
  const handleConfirmBlock = async () => {
    if (!selectedBlockUserId) return;

    try {
      const response = await UserApi.toggleUserBlocked(selectedBlockUserId);
      setBlockDialogOpen(false);
      
      // Update local state instead of reloading
      const updatedUser = response.data;
      setUsers(prevUsers =>
        prevUsers.map(u =>
          Number(u.id) === selectedBlockUserId
            ? { ...u, blocked: updatedUser.blocked }
            : u
        )
      );
      
      console.log(`✅ User ${blockUserNameRef.current} blocked status updated to: ${updatedUser.blocked ? 'Blocked' : 'Unblocked'}`);
      alert(updatedUser.blocked ? `✅ Đã chặn người dùng ${blockUserNameRef.current}` : `✅ Đã bỏ chặn người dùng ${blockUserNameRef.current}`);
    } catch (error) {
      console.error('Error toggling user blocked status:', error);
      alert('Không thể cập nhật trạng thái chặn người dùng');
    }
  };

  const getStatusChip = (isActive: boolean) => {
    if (isActive) {
      return <Chip label="✓ Hoạt động" color="success" size="small" variant="filled" />;
    }
    return <Chip label="✗ Vô hiệu" color="error" size="small" variant="outlined" />;
  };

  const getBlockedStatusChip = (isBlocked: boolean) => {
    if (isBlocked) {
      return <Chip label="🚫 Bị chặn" color="error" size="small" variant="filled" />;
    }
    return <Chip label="✓ Bình thường" color="success" size="small" variant="outlined" />;
  };

  // Check if user has SUPERADMIN role
  const hasSuperAdminRole = (user: any) => {
    if (!user.role) return false;
    // user.role is an array of role objects with name property
    return Array.isArray(user.role) && user.role.some((r: any) => r.name === 'SUPERADMIN');
  };

  // Get role names for display
  const getRoleNames = (roles: any) => {
    if (!Array.isArray(roles)) return '-';
    return roles.map((r: any) => r.name).join(', ') || '-';
  };

  // Format date from ISO timestamp (from backend Instant)
  const formatCreatedDate = (createdAt?: string) => {
    if (!createdAt) return '-';
    try {
      const date = new Date(createdAt);
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return '-';
    }
  };

  // Password validation regex (same as backend)
  // Must have: lowercase, uppercase, digit, 6-12 characters
  const validatePasswordFormat = (password: string): boolean => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,12}$/;
    return passwordPattern.test(password);
  };

  // Handle create user form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create user submit
  const handleCreateUser = async () => {
    setCreateError('');
    
    // Validate form
    if (!newUserForm.userName.trim()) {
      setCreateError('Username không được để trống');
      return;
    }
    if (!newUserForm.name.trim()) {
      setCreateError('Tên người dùng không được để trống');
      return;
    }
    if (!newUserForm.emailAddress.trim()) {
      setCreateError('Email không được để trống');
      return;
    }
    if (!newUserForm.password) {
      setCreateError('Mật khẩu không được để trống');
      return;
    }
    if (newUserForm.password !== newUserForm.repeatPassword) {
      setCreateError('Mật khẩu không khớp');
      return;
    }
    if (!validatePasswordFormat(newUserForm.password)) {
      setCreateError('Mật khẩu phải có: chữ thường (a-z), chữ hoa (A-Z), số (0-9), độ dài 6-12 ký tự. VD: Test123');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await UserApi.register({
        userName: newUserForm.userName,
        name: newUserForm.name,
        emailAddress: newUserForm.emailAddress,
        password: newUserForm.password,
        repeatPassword: newUserForm.repeatPassword,
        active: newUserForm.active,
      } as any);
      
      // Add new user to the list without reload
      const newUser = response.data;
      setUsers(prevUsers => [newUser, ...prevUsers]);
      
      // Reset form and close dialog
      setNewUserForm({
        userName: '',
        name: '',
        emailAddress: '',
        password: '',
        repeatPassword: '',
        active: true,
      });
      setCreateDialogOpen(false);
      setCreateError('');
      alert('✅ Tạo user thành công!');
    } catch (error: any) {
      console.error('Error creating user:', error);
      // Get error message from various possible locations
      let errorMsg = 'Không thể tạo user';
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.errorMessage) {
          errorMsg = data.errorMessage;
          // If there are field errors, append them
          if (data.errors && typeof data.errors === 'object') {
            const fieldErrors = Object.entries(data.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join(', ');
            if (fieldErrors) {
              errorMsg += ` (${fieldErrors})`;
            }
          }
        } else if (data.message) {
          errorMsg = data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      setCreateError(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          👤 Quản lý người dùng
        </Typography>
        <Stack direction="row" gap={2} alignItems="center">
          <Typography variant="body2" color="textSecondary">
            Tổng: {users.length} người dùng
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => setCreateDialogOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            + Tạo user mới
          </Button>
        </Stack>
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
                <SearchIcon sx={{ color: '#000' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#000',
              '& fieldset': {
                borderColor: colors.primary[200],
              },
              '&:hover fieldset': {
                borderColor: colors.primary[900],
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.blueAccent[500],
              },
            },
            '& .MuiOutlinedInput-input::placeholder': {
              color: '#999',
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
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Avatar</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Tên</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Trạng thái chặn</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Ngày tạo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#fff', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{
                    backgroundColor: colors.primary[400],
                    '&:hover': {
                      backgroundColor: colors.primary[300],
                    },
                  }}
                >
                  <TableCell align="center" sx={{ color: '#000', py: 1 }}>
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.fullName}
                      sx={{ width: 40, height: 40, margin: '0 auto' }}
                    >
                      {user.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ color: '#000' }}>{user.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500, color: '#000' }}>{user.fullName}</TableCell>
                  <TableCell sx={{ color: '#000' }}>{user.email}</TableCell>
                  <TableCell sx={{ color: '#000' }}>{getRoleNames(user.role)}</TableCell>
                  <TableCell sx={{ color: '#000' }}>{getStatusChip(user.active ?? true)}</TableCell>
                  <TableCell sx={{ color: '#000' }}>{getBlockedStatusChip(user.blocked ?? false)}</TableCell>
                  <TableCell sx={{ color: '#000' }}>{formatCreatedDate(user.createdAt)}</TableCell>
                  <TableCell align="center" sx={{ color: '#000' }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleToggleClick(Number(user.id), user.fullName, user.active ?? true)
                        }
                        disabled={hasSuperAdminRole(user)}
                        title={hasSuperAdminRole(user) ? 'Không thể chỉnh SUPERADMIN' : (user.active ? 'Vô hiệu hóa' : 'Kích hoạt')}
                        sx={{
                          color: hasSuperAdminRole(user) ? '#ccc' : (user.active ? '#4caf50' : '#ff9800'),
                        }}
                      >
                        {user.active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleBlockClick(Number(user.id), user.fullName, user.blocked ?? false)
                        }
                        disabled={true}
                        title={hasSuperAdminRole(user) ? 'Không thể chặn SUPERADMIN' : (user.blocked ? 'Bỏ chặn' : 'Chặn')}
                        sx={{
                          color: hasSuperAdminRole(user) ? '#ccc' : (user.blocked ? '#f44336' : '#2196f3'),
                        }}
                      >
                        {user.blocked ? '🚫' : '👤'}
                      </IconButton>
                    </Stack>
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
              color: '#000',
              '& .MuiIconButton-root': {
                color: '#000',
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

      {/* Block User Confirmation Dialog */}
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
        <DialogTitle sx={{ color: colors.blueAccent[400], fontWeight: 600 }}>
          🚫 {blockUserStatusRef.current ? 'Bỏ chặn' : 'Chặn'} người dùng
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn {blockUserStatusRef.current ? 'bỏ chặn' : 'chặn'} người dùng{' '}
            <strong>{blockUserNameRef.current}</strong> không?
            <br />
            {blockUserStatusRef.current ? (
              <span style={{ color: colors.blueAccent[400], marginTop: '8px', display: 'block' }}>
                Người dùng sẽ có thể đăng nhập lại bình thường.
              </span>
            ) : (
              <span style={{ color: '#f44336', marginTop: '8px', display: 'block' }}>
                ⚠️ Người dùng sẽ không thể đăng nhập và sẽ nhận được thông báo chặn tài khoản.
              </span>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmBlock} 
            color={blockUserStatusRef.current ? 'success' : 'error'} 
            variant="contained"
          >
            {blockUserStatusRef.current ? 'Bỏ chặn' : 'Chặn'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.blueAccent[400], fontWeight: 600 }}>
          ➕ Tạo user mới
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {createError && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#ffebee', color: '#c62828', borderRadius: 1, fontSize: '0.9rem' }}>
              ❌ {createError}
            </Box>
          )}
          <Stack spacing={2}>
            <TextField
              label="Username"
              name="userName"
              value={newUserForm.userName}
              onChange={handleFormChange}
              fullWidth
              size="small"
              placeholder="vd: admin2"
            />
            <TextField
              label="Tên người dùng"
              name="name"
              value={newUserForm.name}
              onChange={handleFormChange}
              fullWidth
              size="small"
              placeholder="vd: Nguyễn Văn A"
            />
            <TextField
              label="Email"
              name="emailAddress"
              value={newUserForm.emailAddress}
              onChange={handleFormChange}
              fullWidth
              size="small"
              type="email"
              placeholder="vd: admin@example.com"
            />
            <Box>
              <TextField
                label="Mật khẩu"
                name="password"
                value={newUserForm.password}
                onChange={handleFormChange}
                fullWidth
                size="small"
                type="password"
                placeholder="Nhập mật khẩu"
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#666' }}>
                💡 Yêu cầu: Chữ thường (a-z) + Chữ hoa (A-Z) + Số (0-9) + 6-12 ký tự. VD: <strong>Test123</strong>
              </Typography>
            </Box>
            <TextField
              label="Nhập lại mật khẩu"
              name="repeatPassword"
              value={newUserForm.repeatPassword}
              onChange={handleFormChange}
              fullWidth
              size="small"
              type="password"
              placeholder="Nhập lại mật khẩu"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleCreateUser} 
            color="success" 
            variant="contained"
            disabled={createLoading}
          >
            {createLoading ? 'Đang tạo...' : 'Tạo user'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementScreen;
