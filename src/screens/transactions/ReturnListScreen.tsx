import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box } from '@mui/material';

const returnsData = [
  { id: 'RET-3001', orderId: 'ORD-1003', reason: 'Sai sản phẩm', status: 'REQUESTED', createdAt: '2025-10-04' },
];

const ReturnListScreen = () => (
  <Box>
    <Typography variant="h4" fontWeight={600} mb={2}>Đổi trả hàng</Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Mã</TableCell>
          <TableCell>Đơn hàng</TableCell>
          <TableCell>Lý do</TableCell>
          <TableCell>Trạng thái</TableCell>
          <TableCell>Ngày</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {returnsData.map(r => (
          <TableRow key={r.id} hover>
            <TableCell>{r.id}</TableCell>
            <TableCell>{r.orderId}</TableCell>
            <TableCell>{r.reason}</TableCell>
            <TableCell><Chip size="small" label={r.status} /></TableCell>
            <TableCell>{r.createdAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);

export default ReturnListScreen;
