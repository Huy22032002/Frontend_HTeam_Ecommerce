import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button } from '@mui/material';
import { CmsLayout } from '../../components/cms/CmsLayout';

// Placeholder product list to be replaced by API
const products = [
  { id: 'P1001', name: 'Laptop ABC', price: 25990000, stock: 12, status: 'ACTIVE', category: 'Laptop' },
  { id: 'P1002', name: 'Chuột Gaming XYZ', price: 799000, stock: 34, status: 'ACTIVE', category: 'Phụ kiện' },
  { id: 'P1003', name: 'Bàn phím cơ 87 phím', price: 1599000, stock: 0, status: 'OUT', category: 'Phụ kiện' },
];

const ProductListScreen = () => {
  return (
    <CmsLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight={600}>Danh sách sản phẩm</Typography>
        <Button variant="contained" size="small">+ Thêm</Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Mã</TableCell>
            <TableCell>Tên</TableCell>
            <TableCell>Danh mục</TableCell>
            <TableCell align="right">Giá</TableCell>
            <TableCell>Kho</TableCell>
            <TableCell>Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map(p => (
            <TableRow key={p.id} hover>
              <TableCell>{p.id}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell align="right">{p.price.toLocaleString()}₫</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell><Chip size="small" color={p.status === 'ACTIVE' ? 'success' : 'default'} label={p.status === 'OUT' ? 'Hết hàng' : 'Đang bán'} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CmsLayout>
  );
};

export default ProductListScreen;
