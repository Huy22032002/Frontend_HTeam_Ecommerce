import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { ReadableCustomer } from '../../models/customer/ReadableCustomer';
import { CustomerAdminApi } from '../../api/customer/CustomerAdminApi';

interface CustomerListModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: ReadableCustomer) => void;
  selectedCustomer?: ReadableCustomer | null;
}

const CustomerListModal: React.FC<CustomerListModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedCustomer,
}) => {
  const [customers, setCustomers] = useState<ReadableCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch danh sách khách hàng
  const fetchCustomers = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CustomerAdminApi.getAll(pageNum, rowsPerPage);
      setCustomers(response.data.content || response.data);
      setTotalItems(response.data.totalElements || response.data.length);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Lỗi khi tải danh sách khách hàng');
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCustomers(page);
    }
  }, [open]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
    fetchCustomers(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    fetchCustomers(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchCustomers(0);
  };

  const handleSelectCustomer = (customer: ReadableCustomer) => {
    onSelect(customer);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '18px' }}>
        Chọn Khách Hàng
      </DialogTitle>

      <DialogContent>
        {/* Search Field */}
        <Box sx={{ mb: 2, mt: 1 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ color: 'error.main', mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
            {error}
          </Box>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Table */}
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên Khách Hàng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Giới Tính</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày Sinh</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Hành Động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        sx={{
                          backgroundColor:
                            selectedCustomer?.id === customer.id ? '#e3f2fd' : 'inherit',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                      >
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.emailAddress}</TableCell>
                        <TableCell>{customer.gender || '-'}</TableCell>
                        <TableCell>{customer.dateOfBirth || '-'}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleSelectCustomer(customer)}
                            sx={{
                              backgroundColor:
                                selectedCustomer?.id === customer.id
                                  ? '#4caf50'
                                  : '#2196f3',
                              '&:hover': {
                                backgroundColor: '#1976d2',
                              },
                            }}
                          >
                            {selectedCustomer?.id === customer.id ? 'Đã Chọn' : 'Chọn'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        Không tìm thấy khách hàng
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Hàng trên trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
              }
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerListModal;
