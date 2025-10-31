import { Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Box } from '@mui/material';
import { useWarehouses } from '../../hooks/useWarehouses';

const WarehouseScreen = () => {
  const { warehouses, loading, error } = useWarehouses();

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={2}>Kho không kinh doanh</Typography>

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
              <TableCell>Tên kho</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Thành phố</TableCell>
              <TableCell>Số SP không KD</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.map(w => (
              <TableRow key={w.id} hover>
                <TableCell>{w.warehouseName}</TableCell>
                <TableCell>{w.address}</TableCell>
                <TableCell>{w.city}</TableCell>
                <TableCell>{w.inactiveProductsCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default WarehouseScreen;
