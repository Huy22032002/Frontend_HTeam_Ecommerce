import { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Chip, 
  Box,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Container
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { OrderApi } from '../../api/order/OrderApi';
import type { OrderReadableDTO } from '../../models/orders/Order';

interface Filters {
  status?: string;
  carrier?: string;
  search?: string;
}

const ShipmentListScreen = () => {
  const [orders, setOrders] = useState<OrderReadableDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    carrier: '',
    search: '',
  });

  // Fetch orders with shipping status
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch orders that are in SHIPPING or later status
      const response = await OrderApi.getAll({
        page: 0,
        size: 100,
        status: filters.status || 'SHIPPING',
        search: filters.search,
      });
      
      // Filter by carrier if specified
      let filteredOrders = response.data.content || [];
      if (filters.carrier) {
        filteredOrders = filteredOrders.filter((order: any) => 
          order.shippingAddress && order.delivery?.carrier?.includes(filters.carrier)
        );
      }
      
      setOrders(filteredOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err?.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleRefresh = () => {
    setFilters({ status: '', carrier: '', search: '' });
    fetchOrders();
  };

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'info';
      case 'PROCESSING':
        return 'default';
      case 'SHIPPING':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'PARTIALLY_REFUNDED':
        return 'warning';
      case 'REFUNDED':
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'APPROVED':
        return 'Đã xác nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPING':
        return 'Đang giao';
      case 'DELIVERED':
        return 'Đã giao';
      case 'PARTIALLY_REFUNDED':
        return 'Hoàn một phần';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      case 'CANCELLED':
        return 'Đã huỷ';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>📦 Chuyển hàng</Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Làm mới
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            name="search"
            size="small"
            placeholder="Tìm theo mã đơn hàng..."
            value={filters.search}
            onChange={handleFilterChange}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>ĐVVC</InputLabel>
            <Select 
              name="carrier" 
              value={filters.carrier || ''} 
              label="ĐVVC"
              onChange={handleFilterSelectChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="GHN">GHN</MenuItem>
              <MenuItem value="GHTK">GHTK</MenuItem>
              <MenuItem value="SPX">SPX</MenuItem>
              <MenuItem value="VTP">VTP</MenuItem>
              <MenuItem value="EMS">EMS</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            onClick={handleSearch}
            sx={{ textTransform: 'none' }}
          >
            Tìm kiếm
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Mã đơn hàng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ĐVVC</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ giao</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#999' }}>
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {order.orderCode}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {order.delivery?.carrier ? (
                        <Chip label={order.delivery.carrier} size="small" />
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status)}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.shippingAddress}
                    </TableCell>
                    <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default ShipmentListScreen;
