import * as React from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box, TextField, MenuItem, Select, InputLabel, FormControl, CircularProgress, Paper, type SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { CmsLayout } from '../../components/cms/CmsLayout';
import { useOrders } from '../../hooks/useOrders';

const OrderListScreen = () => {
  const { orders, loading, error, filters, setFilters } = useOrders({ page: 0, size: 20 });

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  return (
    <CmsLayout>
      <Typography variant="h4" fontWeight={600} mb={2}>Hoá đơn bán</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField
            name="search"
            size="small"
            placeholder="Tìm kiếm theo mã, tên KH..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
            sx={{ minWidth: 260 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select name="status" value={filters.status || ''} label="Trạng thái" onChange={handleSelectChange}>
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="PAID">Thành công</MenuItem>
              <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
              <MenuItem value="SHIPPED">Đã giao</MenuItem>
              <MenuItem value="CANCELLED">Đã huỷ</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="date"
            size="small"
            type="date"
            label="Ngày tạo"
            InputLabelProps={{ shrink: true }}
            value={filters.date || ''}
            onChange={handleTextFieldChange}
          />
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Lỗi: {String(error)}</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mã</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell align="right">Tổng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map(o => (
              <TableRow key={o.id} hover>
                <TableCell>{o.id}</TableCell>
                <TableCell>{o.customerName}</TableCell>
                <TableCell align="right">{o.total.toLocaleString()}₫</TableCell>
                <TableCell><Chip size="small" color={o.status === 'PAID' ? 'success' : o.status === 'PENDING' ? 'warning' : 'default'} label={o.status} /></TableCell>
                <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CmsLayout>
  );
};

export default OrderListScreen;
