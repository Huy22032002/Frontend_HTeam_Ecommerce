import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CircularProgress,
  TableContainer,
  Paper,
  Chip,
  Alert,
  Switch,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState } from 'react';
import { useCustomers, type Customer } from '../../hooks/useCustomers';
import { CustomerAdminApi } from '../../api/customer/CustomerAdminApi';


const PartnerListScreen = () => {
  const { customers, loading, error, refetch } = useCustomers();
  const [toggling, setToggling] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleBlock = async (customer: Customer) => {
    setToggling(customer.id);
    try {
      await CustomerAdminApi.toggleCustomerBlocked(customer.id);
      setMessage({
        type: 'success',
        text: `Khách hàng ${customer.blocked ? 'đã được bỏ chặn' : 'đã bị chặn'} thành công`,
      });
      setTimeout(() => {
        refetch();
        setMessage(null);
      }, 1000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái khách hàng',
      });
    } finally {
      setToggling(null);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Danh sách Khách hàng
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
      {error && <Alert severity="error">Lỗi: {error}</Alert>}
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    sx={{
                      backgroundColor: customer.blocked ? '#ffebee' : 'inherit',
                      '&:hover': { backgroundColor: customer.blocked ? '#ffcdd2' : '#f5f5f5' },
                    }}
                  >
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.emailAddress || customer.email || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={customer.blocked ? <BlockIcon /> : <CheckCircleIcon />}
                        label={customer.blocked ? 'Bị chặn' : 'Hoạt động'}
                        color={customer.blocked ? 'error' : 'success'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={!customer.blocked}
                        onChange={() => handleToggleBlock(customer)}
                        disabled={toggling === customer.id}
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">Không có khách hàng nào</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PartnerListScreen;
