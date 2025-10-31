import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box } from '@mui/material';

const shipments = [
  { id: 'SHP-2001', orderId: 'ORD-1001', carrier: 'GHN', status: 'IN_TRANSIT', updatedAt: '2025-10-03' },
  { id: 'SHP-2002', orderId: 'ORD-1002', carrier: 'GHTK', status: 'PENDING', updatedAt: '2025-10-03' },
];

const ShipmentListScreen = () => (
  <Box>
    <Typography variant="h4" fontWeight={600} mb={2}>Chuyển hàng</Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Vận đơn</TableCell>
          <TableCell>Đơn hàng</TableCell>
          <TableCell>ĐVVC</TableCell>
          <TableCell>Trạng thái</TableCell>
          <TableCell>Cập nhật</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {shipments.map(s => (
          <TableRow key={s.id} hover>
            <TableCell>{s.id}</TableCell>
            <TableCell>{s.orderId}</TableCell>
            <TableCell>{s.carrier}</TableCell>
            <TableCell><Chip size="small" label={s.status} /></TableCell>
            <TableCell>{s.updatedAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);

export default ShipmentListScreen;
