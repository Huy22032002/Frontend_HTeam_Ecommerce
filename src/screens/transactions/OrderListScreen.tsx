import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { CmsLayout } from '../../components/cms/CmsLayout';

const orders = [
  { id: 'ORD-1001', customer: 'Nguyễn Văn A', total: 1250000, status: 'PAID', createdAt: '2025-10-01' },
  { id: 'ORD-1002', customer: 'Trần Thị B', total: 890000, status: 'PENDING', createdAt: '2025-10-02' },
  { id: 'ORD-1003', customer: 'Lê Văn C', total: 4320000, status: 'SHIPPED', createdAt: '2025-10-03' },
];

const OrderListScreen = () => (
  <CmsLayout>
    <Typography variant="h4" fontWeight={600} mb={2}>Đơn hàng</Typography>
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
            <TableCell>{o.customer}</TableCell>
            <TableCell align="right">{o.total.toLocaleString()}₫</TableCell>
            <TableCell><Chip size="small" color={o.status === 'PAID' ? 'success' : 'default'} label={o.status} /></TableCell>
            <TableCell>{o.createdAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CmsLayout>
);

export default OrderListScreen;
