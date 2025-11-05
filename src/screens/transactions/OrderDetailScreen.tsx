import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate, useParams } from 'react-router-dom';
import { OrderApi } from '../../api/order/OrderApi';
import { InvoiceApi } from '../../api/invoice/InvoiceApi';
import type { OrderReadableDTO } from '../../models/orders/Order';
import { formatCurrency } from '../../utils/formatCurrency';
import { printOrderDetail } from '../../utils/printUtils';
import OrderPrintTemplate from '../../components/print/OrderPrintTemplate';

const OrderDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  
  const [order, setOrder] = useState<OrderReadableDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  const handlePrint = () => {
    if (!order) return;
    
    // Get the template element and extract just the print-container div
    const printElement = document.getElementById('order-print-template');
    if (printElement) {
      const printContainer = printElement.querySelector('.print-container');
      if (printContainer) {
        printOrderDetail(printContainer.outerHTML);
      }
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Không tìm thấy ID đơn hàng');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await OrderApi.getById(orderId);
        setOrder(response.data);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err?.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn huỷ đơn hàng này không?')) {
      return;
    }

    if (!orderId) return;

    try {
      setCanceling(true);
      await OrderApi.delete(orderId);
      alert('✅ Huỷ đơn hàng thành công!');
      navigate('/orders');
    } catch (err: any) {
      console.error('Error canceling order:', err);
      setError(err?.response?.data?.message || '❌ Lỗi khi huỷ đơn hàng');
    } finally {
      setCanceling(false);
    }
  };

  const handleExportInvoice = async () => {
    if (!order || !orderId) return;

    try {
      // Gọi API backend để tạo Invoice
      const response = await InvoiceApi.createFromOrder(orderId);
      const newInvoice = response.data;

      // Navigate đến Invoice Detail Screen
      navigate(`/admin/invoices/${newInvoice.id}`);
    } catch (err: any) {
      console.error('Error creating invoice:', err);
      const errorMsg = err?.response?.data?.message || err.message || 'Lỗi khi tạo hoá đơn';
      alert(`❌ ${errorMsg}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return 'warning';
      case 'PAID':
        return 'success';
      case 'SHIPPED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'PAID':
        return 'Đã thanh toán';
      case 'SHIPPED':
        return 'Đã giao';
      case 'CANCELLED':
        return 'Đã huỷ';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: 4, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth={false} sx={{ py: 4, minHeight: '100vh' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>Quay lại</Button>
        <Alert severity="error">{error || 'Không tìm thấy đơn hàng'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, backgroundColor: '#f8f9fa', minHeight: '100vh', px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>📋 Chi Tiết Đơn Hàng</Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>Mã đơn: DH-{order.id}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<PrintIcon />} variant="contained" onClick={handlePrint} sx={{ textTransform: 'none', backgroundColor: '#4CAF50' }}>In</Button>
          <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate(-1)} sx={{ textTransform: 'none', px: 3 }}>Quay Lại</Button>
        </Box>
      </Box>

      <Box className="order-print-area" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Left */}
        <Box>
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardHeader title="📦 Thông Tin Đơn Hàng" sx={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e8ebf0' }} />
            <CardContent sx={{ pt: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Khách hàng</Typography>
                  <Typography variant="h6" sx={{ fontWeight: '600', color: '#1976d2' }}>{order.customerName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Trạng thái</Typography>
                  <Chip label={getStatusLabel(order.status)} color={getStatusColor(order.status) as any} variant="filled" />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Ngày tạo</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>{new Date(order.createdAt).toLocaleString('vi-VN')}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Mã đơn hàng</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '500', color: '#1976d2' }}>{order.orderCode}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardHeader title="🏠 Thông Tin Giao Hàng" sx={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e8ebf0' }} />
            <CardContent sx={{ pt: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Người nhận</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>{order.receiverName || 'Chưa có thông tin'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Số điện thoại</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>{order.receiverPhoneNumber || 'Chưa có thông tin'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Địa chỉ giao hàng</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>{order.shippingAddress || 'Chưa có thông tin'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardHeader title="🛍️ Sản Phẩm Trong Đơn Hàng" sx={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e8ebf0' }} />
            <CardContent sx={{ pt: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f0f2f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#1976d2' }}>Sản Phẩm</TableCell>
                      <TableCell align="center" sx={{ fontWeight: '600', color: '#1976d2' }}>SL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '600', color: '#1976d2' }}>Giá</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '600', color: '#1976d2' }}>Thành Tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item: any, index: number) => (
                        <TableRow key={index} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: '600', mb: 0.5 }}>{item.productName || item.sku}</Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>SKU: {item.sku}</Typography>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(item.finalPrice)}</TableCell>
                          <TableCell align="right"><Typography sx={{ fontWeight: 'bold', color: '#2196f3' }}>{formatCurrency(item.finalPrice * item.quantity)}</Typography></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: '#999' }}>Không có sản phẩm</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Right */}
        <Box sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <CardHeader title="💰 Tóm Tắt Đơn Hàng" sx={{ backgroundColor: '#1976d2', color: 'white' }} />
            <CardContent sx={{ pt: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>Tổng sản phẩm:</Typography>
                <Typography variant="body2" sx={{ fontWeight: '600' }}>{order.items ? order.items.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0} cái</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, border: '2px solid #1976d2' }}>
                <Typography variant="h6" sx={{ fontWeight: '600', color: '#1565c0' }}>TỔNG CỘNG:</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565c0' }}>{formatCurrency(order.total)}</Typography>
              </Box>
              <Divider sx={{ my: 3 }} />
              {order.deposits && order.deposits.length > 0 && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: '600' }}>Thanh Toán ({order.deposits.length}):</Typography>
                    {order.deposits.map((transaction: any, idx: number) => (
                      <Box key={idx} sx={{ p: 1.5, mb: 1, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#666' }}>Phương thức: <Chip label={transaction.paymentType} size="small" variant="outlined" sx={{ ml: 0.5 }} /></Typography>
                          <Chip label={transaction.status} size="small" color={transaction.status === 'COMPLETED' ? 'success' : transaction.status === 'PENDING' ? 'warning' : 'error'} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>Số tiền:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: '600', color: '#1976d2' }}>{formatCurrency(transaction.amount)}</Typography>
                        </Box>
                        {transaction.transactionDate && (
                          <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>{new Date(transaction.transactionDate).toLocaleString('vi-VN')}</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button fullWidth variant="contained" onClick={() => navigate(-1)} sx={{ textTransform: 'none', backgroundColor: '#1976d2', py: 1.2, '&:hover': { backgroundColor: '#1565c0' } }}>← Quay Lại</Button>
                <Button fullWidth variant="contained" color="success" startIcon={<FileDownloadIcon />} onClick={handleExportInvoice} sx={{ textTransform: 'none', py: 1.2 }}>📥 Xuất Hoá Đơn</Button>
                {order.status !== 'CANCELLED' && <Button fullWidth variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleCancelOrder} disabled={canceling} sx={{ textTransform: 'none', py: 1.2 }}>{canceling ? 'Đang xử lý...' : '❌ Huỷ Đơn Hàng'}</Button>}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Hidden Print Template */}
      <Box id="order-print-template" sx={{ display: 'none' }}>
        <OrderPrintTemplate order={order!} />
      </Box>
    </Container>
  );
};

export default OrderDetailScreen;
