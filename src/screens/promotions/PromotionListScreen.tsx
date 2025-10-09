import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Box } from '@mui/material';
import { CmsLayout } from '../../components/cms/CmsLayout';

const promotions = [
  { id: 'KM-01', name: 'Giảm giá 10%', type: 'Phần trăm', status: 'ACTIVE', start: '2025-10-01', end: '2025-10-31' },
  { id: 'KM-02', name: 'Tặng quà', type: 'Quà tặng', status: 'INACTIVE', start: '2025-09-01', end: '2025-09-30' },
];

const PromotionListScreen = () => (
  <CmsLayout>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <Typography variant="h4" fontWeight={600}>Khuyến mãi</Typography>
      <Button variant="contained" size="small">+ Thêm</Button>
    </Box>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Mã</TableCell>
          <TableCell>Tên chương trình</TableCell>
          <TableCell>Loại</TableCell>
          <TableCell>Trạng thái</TableCell>
          <TableCell>Ngày bắt đầu</TableCell>
          <TableCell>Ngày kết thúc</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {promotions.map(p => (
          <TableRow key={p.id} hover>
            <TableCell>{p.id}</TableCell>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.type}</TableCell>
            <TableCell><Chip size="small" color={p.status === 'ACTIVE' ? 'success' : 'default'} label={p.status === 'ACTIVE' ? 'Đang chạy' : 'Ngừng'} /></TableCell>
            <TableCell>{p.start}</TableCell>
            <TableCell>{p.end}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CmsLayout>
);

export default PromotionListScreen;
