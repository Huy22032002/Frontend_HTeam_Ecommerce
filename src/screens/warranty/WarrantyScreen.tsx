import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { CmsLayout } from '../../components/cms/CmsLayout';

const warrantyForms = [
  { id: 'WR-01', product: 'Laptop ABC', customer: 'Nguyễn Văn A', status: 'OPEN', createdAt: '2025-10-04' },
];

const WarrantyScreen = () => (
  <CmsLayout>
    <Typography variant="h4" fontWeight={600} mb={2}>Phiếu bảo hành</Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Mã</TableCell>
          <TableCell>Sản phẩm</TableCell>
          <TableCell>Khách hàng</TableCell>
          <TableCell>Trạng thái</TableCell>
          <TableCell>Ngày</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {warrantyForms.map(f => (
          <TableRow key={f.id} hover>
            <TableCell>{f.id}</TableCell>
            <TableCell>{f.product}</TableCell>
            <TableCell>{f.customer}</TableCell>
            <TableCell><Chip size="small" label={f.status} /></TableCell>
            <TableCell>{f.createdAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CmsLayout>
);

export default WarrantyScreen;
