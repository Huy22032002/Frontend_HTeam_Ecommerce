import { Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { CmsLayout } from '../../components/cms/CmsLayout';

const warehouseItems = [
  { id: 'W1', name: 'Kho Hà Nội', inactiveProducts: 12 },
  { id: 'W2', name: 'Kho HCM', inactiveProducts: 5 },
];

const WarehouseScreen = () => (
  <CmsLayout>
    <Typography variant="h4" fontWeight={600} mb={2}>Kho không kinh doanh</Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Kho</TableCell>
          <TableCell>Số SP không KD</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {warehouseItems.map(w => (
          <TableRow key={w.id} hover>
            <TableCell>{w.name}</TableCell>
            <TableCell>{w.inactiveProducts}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CmsLayout>
);

export default WarehouseScreen;
