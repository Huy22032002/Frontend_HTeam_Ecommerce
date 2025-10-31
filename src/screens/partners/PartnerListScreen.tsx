import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, CircularProgress } from '@mui/material';
import { useCustomers } from '../../hooks/useCustomers';

const PartnerListScreen = () => {
  const { customers, loading, error } = useCustomers();

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={2}>Đối tác / Khách hàng</Typography>
      
      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
      {error && <Typography color="error">Lỗi: {error}</Typography>}
      {!loading && !error && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Địa chỉ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map(c => (
              <TableRow key={c.id} hover>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone || '-'}</TableCell>
                <TableCell>{c.address || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default PartnerListScreen;
