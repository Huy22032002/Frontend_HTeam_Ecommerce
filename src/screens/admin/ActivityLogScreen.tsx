import React, { useState } from 'react';
import {
  Box,
  Button,
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
import { ActivityLogApi } from '../../api/activity/ActivityLogApi';
import { downloadExcelFile } from '../../utils/exportToExcel';
import type { RootState } from '../../store/store';

// Mapping tiếng Việt cho loại hành động của Customer
const CUSTOMER_ACTION_TYPES = {
  CREATE_ORDER: 'Tạo đơn hàng',
  CANCEL_ORDER: 'Huỷ đơn hàng',
  UPDATE_PROFILE: 'Cập nhật hồ sơ',
  CHANGE_PASSWORD: 'Đổi mật khẩu',
  UPDATE_ADDRESS: 'Cập nhật địa chỉ',
  DELETE_ADDRESS: 'Xoá địa chỉ',
  CREATE_REVIEW: 'Tạo đánh giá',
  UPDATE_REVIEW: 'Cập nhật đánh giá',
  DELETE_REVIEW: 'Xoá đánh giá',
  ADD_TO_CART: 'Thêm vào giỏ',
  REMOVE_FROM_CART: 'Xoá khỏi giỏ',
  CLEAR_CART: 'Xoá giỏ hàng',
  CREATE_PAYMENT: 'Tạo thanh toán',
  PROCESS_PAYMENT: 'Xử lý thanh toán',
  REFUND_PAYMENT: 'Hoàn tiền',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  APPLY_VOUCHER: 'Áp dụng voucher',
};

// Mapping tiếng Việt cho loại hành động của Admin
const ADMIN_ACTION_TYPES = {
  CREATE_ORDER: 'Tạo đơn hàng',
  UPDATE_ORDER_STATUS: 'Cập nhật trạng thái đơn',
  CANCEL_ORDER: 'Huỷ đơn hàng',
  CREATE_PRODUCT: 'Tạo sản phẩm',
  UPDATE_PRODUCT: 'Cập nhật sản phẩm',
  DELETE_PRODUCT: 'Xoá sản phẩm',
  MANAGE_PROMOTION: 'Quản lý khuyến mãi',
  MANAGE_WAREHOUSE: 'Quản lý kho hàng',
  CREATE_PAYMENT: 'Tạo thanh toán',
  PROCESS_PAYMENT: 'Xử lý thanh toán',
  REFUND_PAYMENT: 'Hoàn tiền',
  EXPORT_REPORT: 'Xuất báo cáo',
  VIEW_ANALYTICS: 'Xem phân tích',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
};

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
  const [exporting, setExporting] = useState(false);
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

  // Get action types based on selected tab
  const currentActionTypes = selectedTab === 'CUSTOMER' ? CUSTOMER_ACTION_TYPES : ADMIN_ACTION_TYPES;

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
    setLocalFilters((prev) => ({ ...prev, actionType: '' })); // Reset action type filter
    setFilters({
      page: 0,
      size: rowsPerPage,
      userType: newValue,
      actionType: undefined,
      startDate: localFilters.startDate || undefined,
      endDate: localFilters.endDate || undefined,
    });
  };

  // Handle action type filter
  const handleActionTypeChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as string;
    setLocalFilters((prev) => ({ ...prev, actionType: value }));
    setPage(0);
    setFilters({
      page: 0,
      size: rowsPerPage,
      userType: selectedTab,
      actionType: value || undefined,
      startDate: localFilters.startDate || undefined,
      endDate: localFilters.endDate || undefined,
    });
  };

  // Handle start date filter
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({ ...prev, startDate: value }));
    setPage(0);
    setFilters({
      page: 0,
      size: rowsPerPage,
      userType: selectedTab,
      actionType: localFilters.actionType || undefined,
      startDate: value || undefined,
      endDate: localFilters.endDate || undefined,
    });
  };

  // Handle end date filter
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({ ...prev, endDate: value }));
    setPage(0);
    setFilters({
      page: 0,
      size: rowsPerPage,
      userType: selectedTab,
      actionType: localFilters.actionType || undefined,
      startDate: localFilters.startDate || undefined,
      endDate: value || undefined,
    });
  };

  // Handle pagination
  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
    setFilters({
      page: newPage,
      size: rowsPerPage,
      userType: selectedTab,
      actionType: localFilters.actionType || undefined,
      startDate: localFilters.startDate || undefined,
      endDate: localFilters.endDate || undefined,
    });
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
    setFilters({
      page: 0,
      size: newSize,
      userType: selectedTab,
      actionType: localFilters.actionType || undefined,
      startDate: localFilters.startDate || undefined,
      endDate: localFilters.endDate || undefined,
    });
  };

  // Get Vietnamese label for action type
  const getActionTypeLabel = (actionKey: string): string => {
    return currentActionTypes[actionKey as keyof typeof currentActionTypes] || actionKey;
  };

  // Handle export to Excel
  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      const response = await ActivityLogApi.exportToExcel({
        userType: selectedTab,
        actionType: localFilters.actionType || undefined,
        startDate: localFilters.startDate || undefined,
        endDate: localFilters.endDate || undefined,
      });

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'Nhat_ky_hoat_dong.xlsx';
      if (contentDisposition) {
        try {
          filename =
            contentDisposition.split('filename=')[1].split('"')[1] ||
            filename;
        } catch (e) {
          // Use default filename if parsing fails
        }
      }

      downloadExcelFile(response.data, filename);
    } catch (error) {
      console.error('Lỗi khi xuất file:', error);
      alert('Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
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
          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel>Loại hành động</InputLabel>
            <Select
              value={localFilters.actionType}
              label="Loại hành động"
              onChange={handleActionTypeChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(currentActionTypes).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
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

          <Button
            variant="contained"
            color="success"
            onClick={handleExportToExcel}
            disabled={exporting || logs.length === 0}
          >
            {exporting ? '⏳ Đang xuất...' : '📊 Xuất Excel'}
          </Button>
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
                        label={getActionTypeLabel(log.actionType)}
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
