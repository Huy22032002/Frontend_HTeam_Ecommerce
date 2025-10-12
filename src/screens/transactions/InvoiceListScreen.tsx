import * as React from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box, TextField, MenuItem, Select, InputLabel, FormControl, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { CmsLayout } from '../../components/cms/CmsLayout';

const invoices = [
  { id: 'INV-2025-001', orderId: 'ORD-1001', customer: 'Nguyễn Văn A', total: 1250000, status: 'PAID', createdAt: '2025-10-01', paymentMethod: 'Chuyển khoản' },
  { id: 'INV-2025-002', orderId: 'ORD-1002', customer: 'Trần Thị B', total: 890000, status: 'UNPAID', createdAt: '2025-10-02', paymentMethod: 'Tiền mặt' },
  { id: 'INV-2025-003', orderId: 'ORD-1003', customer: 'Lê Văn C', total: 4320000, status: 'PAID', createdAt: '2025-10-03', paymentMethod: 'Chuyển khoản' },
  { id: 'INV-2025-004', orderId: 'ORD-1004', customer: 'Phạm Thị D', total: 250000, status: 'OVERDUE', createdAt: '2025-09-15', paymentMethod: 'Tiền mặt' },
];

const InvoiceListScreen = () => {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [date, setDate] = React.useState('');

  const filteredInvoices = invoices.filter(inv => {
    if (search && !(
      inv.customer.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderId.toLowerCase().includes(search.toLowerCase())
    )) return false;
    if (status && inv.status !== status) return false;
    if (date && inv.createdAt !== date) return false;
    return true;
  });

  return (
    <CmsLayout>
      <Typography variant="h4" fontWeight={600} mb={2}>Danh sách Hóa đơn</Typography>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
        <TextField
          size="small"
          placeholder="Tìm kiếm theo mã HĐ, mã đơn, tên KH..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
          sx={{ minWidth: 280 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái thanh toán</InputLabel>
          <Select value={status} label="Trạng thái thanh toán" onChange={e => setStatus(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="PAID">Đã thanh toán</MenuItem>
            <MenuItem value="UNPAID">Chưa thanh toán</MenuItem>
            <MenuItem value="OVERDUE">Quá hạn</MenuItem>
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
            <TableCell>Mã hóa đơn</TableCell>
            <TableCell>Mã đơn hàng</TableCell>
            <TableCell>Khách hàng</TableCell>
            <TableCell>Ngày tạo</TableCell>
            <TableCell>Phương thức TT</TableCell>
            <TableCell align="right">Tổng tiền</TableCell>
            <TableCell>Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredInvoices.map(inv => (
            <TableRow key={inv.id} hover>
              <TableCell>{inv.id}</TableCell>
              <TableCell>{inv.orderId}</TableCell>
              <TableCell>{inv.customer}</TableCell>
              <TableCell>{inv.createdAt}</TableCell>
              <TableCell>{inv.paymentMethod}</TableCell>
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
    </CmsLayout>
  );
};

export default InvoiceListScreen;