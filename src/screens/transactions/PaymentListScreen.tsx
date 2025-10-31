import React from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box, TextField, MenuItem, Select, InputLabel, FormControl, Button, CircularProgress, type SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { usePayments } from '../../hooks/usePayments';

const PaymentListScreen = () => {
  const { payments, loading, error, filters, setFilters } = usePayments({ page: 0, size: 20 });

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
    <Box>
      <Typography variant="h4" fontWeight={600} mb={2}>Lịch sử Thanh toán</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
        <TextField
          name="search"
          size="small"
          placeholder="Tìm kiếm theo mã TT, mã HĐ, tên KH..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
          sx={{ minWidth: 280 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select name="status" value={filters.status || ''} label="Trạng thái" onChange={handleSelectChange}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
            <MenuItem value="PENDING">Đang chờ</MenuItem>
            <MenuItem value="FAILED">Thất bại</MenuItem>
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
        <Button variant="outlined">Xuất file</Button>
      </Box>

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
              <TableCell>Mã thanh toán</TableCell>
              <TableCell>Mã hóa đơn</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Phương thức</TableCell>
              <TableCell align="right">Số tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>{p.paymentCode}</TableCell>
                <TableCell>{p.invoiceCode}</TableCell>
                <TableCell>{p.customerName}</TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{p.paymentMethod}</TableCell>
                <TableCell align="right">{p.amount.toLocaleString()}₫</TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    label={p.status === 'COMPLETED' ? 'Hoàn thành' : p.status === 'PENDING' ? 'Đang chờ' : 'Thất bại'}
                    color={p.status === 'COMPLETED' ? 'success' : p.status === 'PENDING' ? 'warning' : 'error'} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default PaymentListScreen;