import React from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box, TextField, MenuItem, Select, InputLabel, FormControl, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { CmsLayout } from '../../components/cms/CmsLayout';

const payments = [
  { id: 'PAY-001', invoiceId: 'INV-2025-001', customer: 'Nguyễn Văn A', amount: 1250000, status: 'COMPLETED', createdAt: '2025-10-01', paymentMethod: 'Chuyển khoản' },
  { id: 'PAY-002', invoiceId: 'INV-2025-003', customer: 'Lê Văn C', amount: 4320000, status: 'COMPLETED', createdAt: '2025-10-03', paymentMethod: 'Chuyển khoản' },
  { id: 'PAY-003', invoiceId: 'INV-2025-002', customer: 'Trần Thị B', amount: 500000, status: 'PENDING', createdAt: '2025-10-04', paymentMethod: 'Tiền mặt' },
  { id: 'PAY-004', invoiceId: 'INV-2025-004', customer: 'Phạm Thị D', amount: 100000, status: 'FAILED', createdAt: '2025-10-05', paymentMethod: 'Ví điện tử' },
];

const PaymentListScreen = () => {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [date, setDate] = React.useState('');

  const filteredPayments = payments.filter(p => {
    if (search && !(
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceId.toLowerCase().includes(search.toLowerCase())
    )) return false;
    if (status && p.status !== status) return false;
    if (date && p.createdAt !== date) return false;
    return true;
  });

  return (
    <CmsLayout>
      <Typography variant="h4" fontWeight={600} mb={2}>Lịch sử Thanh toán</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
        <TextField
          size="small"
          placeholder="Tìm kiếm theo mã TT, mã HĐ, tên KH..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
          sx={{ minWidth: 280 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select value={status} label="Trạng thái" onChange={e => setStatus(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
            <MenuItem value="PENDING">Đang chờ</MenuItem>
            <MenuItem value="FAILED">Thất bại</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="date"
          label="Ngày tạo"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <Button variant="outlined">Xuất file</Button>
      </Box>
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
          {filteredPayments.map(p => (
            <TableRow key={p.id} hover>
              <TableCell>{p.id}</TableCell>
              <TableCell>{p.invoiceId}</TableCell>
              <TableCell>{p.customer}</TableCell>
              <TableCell>{p.createdAt}</TableCell>
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
    </CmsLayout>
  );
};

export default PaymentListScreen;