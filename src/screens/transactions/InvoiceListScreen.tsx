import * as React from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box, TextField, MenuItem, Select, InputLabel, FormControl, Button, CircularProgress, type SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useInvoices } from '../../hooks/useInvoices';

const InvoiceListScreen = () => {
  const { invoices, loading, error, filters, setFilters } = useInvoices({ page: 0, size: 20 });

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
      <Typography variant="h4" fontWeight={600} mb={2}>Danh sách Hóa đơn</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
        <TextField
          name="search"
          size="small"
          placeholder="Tìm kiếm theo mã HĐ, mã đơn, tên KH..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
          sx={{ minWidth: 280 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái thanh toán</InputLabel>
          <Select name="status" value={filters.status || ''} label="Trạng thái thanh toán" onChange={handleSelectChange}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="PAID">Đã thanh toán</MenuItem>
            <MenuItem value="UNPAID">Chưa thanh toán</MenuItem>
            <MenuItem value="OVERDUE">Quá hạn</MenuItem>
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
              <TableCell>Mã hóa đơn</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map(inv => (
              <TableRow key={inv.id} hover>
                <TableCell>{inv.invoiceCode}</TableCell>
                <TableCell>{inv.customerName}</TableCell>
                <TableCell>{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell align="right">{inv.total.toLocaleString()}₫</TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    label={inv.status === 'PAID' ? 'Đã thanh toán' : inv.status === 'UNPAID' ? 'Chưa thanh toán' : 'Quá hạn'}
                    color={inv.status === 'PAID' ? 'success' : inv.status === 'UNPAID' ? 'warning' : 'error'} 
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

export default InvoiceListScreen;