import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useActivityLog } from '../../hooks/useActivityLog';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const ActivityLogScreen = () => {
  const userState = useSelector((state: RootState) => state.userAuth);
  console.log('User State:', userState);
  
  // Extract role names from the role Set/Array
  const userRole = userState?.user?.role || [];
  const roleNames = Array.isArray(userRole) 
    ? userRole.map((r: any) => typeof r === 'string' ? r : r?.name || '')
    : [];
  
  const [selectedTab, setSelectedTab] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [localFilters, setLocalFilters] = useState({
    actionType: '',
    startDate: '',
    endDate: '',
    userName: '',
    entityType: '',
  });

  // Check if user is SuperAdmin (match all variations)
  const isSuperAdmin = roleNames.some((role: string) => 
    role?.toUpperCase()?.includes('SUPERADMIN') || 
    role?.toUpperCase()?.includes('SUPER_ADMIN')
  );

  const { logs, total, loading, error, setFilters } = useActivityLog({
    page,
    size: rowsPerPage,
    userType: selectedTab,
    actionType: localFilters.actionType || undefined,
    startDate: localFilters.startDate || undefined,
    endDate: localFilters.endDate || undefined,
  });

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'CUSTOMER' | 'ADMIN') => {
    setSelectedTab(newValue);
    setPage(0);
    setFilters((prev) => ({
      ...prev,
      page: 0,
      userType: newValue,
    }));
  };

  // Handle action type filter
  const handleActionTypeChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as string;
    setLocalFilters((prev) => ({ ...prev, actionType: value }));
    setPage(0);
    setFilters((prev) => ({ ...prev, actionType: value || undefined, page: 0 }));
  };

  // Handle start date filter
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({ ...prev, startDate: value }));
    setPage(0);
    setFilters((prev) => ({ ...prev, startDate: value || undefined, page: 0 }));
  };

  // Handle end date filter
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({ ...prev, endDate: value }));
    setPage(0);
    setFilters((prev) => ({ ...prev, endDate: value || undefined, page: 0 }));
  };

  // Handle pagination
  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
    setFilters((prev) => ({ ...prev, page: 0, size: newSize }));
  };

  // Access control
  if (!isSuperAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ bgcolor: '#ffebee' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#c62828' }}>
              ❌ Truy cập bị từ chối
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: '#d32f2f' }}>
              Chỉ SuperAdmin mới có quyền truy cập màn hình Activity Log.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Get status color
  const getStatusColor = (status: string): 'success' | 'error' | 'warning' => {
    return status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'error' : 'warning';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          📋 Nhật ký hoạt động
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Xem lịch sử hoạt động của khách hàng và quản trị viên
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              minWidth: 150,
            },
          }}
        >
          <Tab
            label="👥 Khách hàng"
            value="CUSTOMER"
            sx={{
              color: selectedTab === 'CUSTOMER' ? '#1976d2' : 'inherit',
              borderBottom: selectedTab === 'CUSTOMER' ? '3px solid #1976d2' : 'none',
            }}
          />
          <Tab
            label="🛡️ Quản trị viên"
            value="ADMIN"
            sx={{
              color: selectedTab === 'ADMIN' ? '#1976d2' : 'inherit',
              borderBottom: selectedTab === 'ADMIN' ? '3px solid #1976d2' : 'none',
            }}
          />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Loại hành động</InputLabel>
            <Select
              value={localFilters.actionType}
              label="Loại hành động"
              onChange={handleActionTypeChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="CREATE_ORDER">Tạo đơn hàng</MenuItem>
              <MenuItem value="UPDATE_ORDER_STATUS">Cập nhật trạng thái đơn</MenuItem>
              <MenuItem value="CANCEL_ORDER">Huỷ đơn hàng</MenuItem>
              <MenuItem value="CREATE_PAYMENT">Tạo thanh toán</MenuItem>
              <MenuItem value="PROCESS_PAYMENT">Xử lý thanh toán</MenuItem>
              <MenuItem value="REFUND_PAYMENT">Hoàn tiền</MenuItem>
              <MenuItem value="UPDATE_PROFILE">Cập nhật hồ sơ</MenuItem>
              <MenuItem value="CHANGE_PASSWORD">Đổi mật khẩu</MenuItem>
              <MenuItem value="UPDATE_ADDRESS">Cập nhật địa chỉ</MenuItem>
              <MenuItem value="DELETE_ADDRESS">Xoá địa chỉ</MenuItem>
              <MenuItem value="CREATE_REVIEW">Tạo đánh giá</MenuItem>
              <MenuItem value="UPDATE_REVIEW">Cập nhật đánh giá</MenuItem>
              <MenuItem value="DELETE_REVIEW">Xoá đánh giá</MenuItem>
              <MenuItem value="ADD_TO_CART">Thêm vào giỏ</MenuItem>
              <MenuItem value="REMOVE_FROM_CART">Xoá khỏi giỏ</MenuItem>
              <MenuItem value="CLEAR_CART">Xoá giỏ hàng</MenuItem>
              <MenuItem value="CREATE_PRODUCT">Tạo sản phẩm</MenuItem>
              <MenuItem value="UPDATE_PRODUCT">Cập nhật sản phẩm</MenuItem>
              <MenuItem value="DELETE_PRODUCT">Xoá sản phẩm</MenuItem>
              <MenuItem value="MANAGE_PROMOTION">Quản lý khuyến mãi</MenuItem>
              <MenuItem value="MANAGE_WAREHOUSE">Quản lý kho hàng</MenuItem>
              <MenuItem value="LOGIN">Đăng nhập</MenuItem>
              <MenuItem value="LOGOUT">Đăng xuất</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Từ ngày"
            InputLabelProps={{ shrink: true }}
            value={localFilters.startDate}
            onChange={handleStartDateChange}
            size="small"
          />

          <TextField
            type="date"
            label="Đến ngày"
            InputLabelProps={{ shrink: true }}
            value={localFilters.endDate}
            onChange={handleEndDateChange}
            size="small"
          />

          <Box sx={{ flex: 1 }} />
        </Box>
      </Paper>

      {/* Error Message */}
      {error && (
        <Box sx={{ p: 2, mb: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography sx={{ color: '#c62828' }}>⚠️ {error}</Typography>
        </Box>
      )}

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ color: '#999' }}>
            Không có dữ liệu hoạt động cho {selectedTab === 'CUSTOMER' ? 'khách hàng' : 'quản trị viên'}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: '15%' }}>
                    {selectedTab === 'CUSTOMER' ? 'Khách hàng' : 'Quản trị viên'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '15%' }}>Hành động</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '20%' }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '15%' }}>Thực thể</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '12%' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '23%' }}>Thời gian</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {log.userName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          ID: {log.userId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.actionType}
                        size="small"
                        variant="outlined"
                        sx={{ bgcolor: '#e3f2fd' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.description}</Typography>
                    </TableCell>
                    <TableCell>
                      {log.entityType ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {log.entityType}
                          </Typography>
                          {log.entityId && (
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              {log.entityId}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        size="small"
                        color={getStatusColor(log.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(log.createdAt)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </>
      )}
    </Box>
  );
};

export default ActivityLogScreen;
