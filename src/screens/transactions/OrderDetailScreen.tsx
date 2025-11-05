import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
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
  Paper,
  Snackbar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate, useParams } from 'react-router-dom';
import { OrderApi } from '../../api/order/OrderApi';
import { InvoiceApi } from '../../api/invoice/InvoiceApi';
import type { OrderReadableDTO } from '../../models/orders/Order';
import { formatCurrency } from '../../utils/formatCurrency';
import { printOrderDetail } from '../../utils/printUtils';
import OrderPrintTemplate from '../../components/print/OrderPrintTemplate';

const SHIPPING_METHODS = ['GHN', 'GHTK', 'SPX', 'VTP', 'EMS'];

const OrderDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  
  const [order, setOrder] = useState<OrderReadableDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openShippingDialog, setOpenShippingDialog] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('GHN');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Detect if accessed from admin panel or customer
  const isAdminPanel = window.location.pathname.startsWith('/admin');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'info';
      case 'PROCESSING':
        return 'warning';
      case 'SHIPPING':
        return 'info';
      case 'DELIVERED':
        return 'success';
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
        return 'Đã nhận';
      case 'CANCELLED':
        return 'Đã huỷ';
      default:
        return status;
    }
  };

  const canTransitionTo = (currentStatus: string, nextStatus: string): boolean => {
    const transitions: { [key: string]: string[] } = {
      PENDING: ['APPROVED', 'CANCELLED'],
      APPROVED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPING', 'CANCELLED'],
      SHIPPING: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };
    return transitions[currentStatus]?.includes(nextStatus) || false;
  };

  const handleUpdateOrderStatus = async (newStatus: string) => {
    if (!orderId || !order) return;

    if (!canTransitionTo(order.status, newStatus)) {
      setSnackbar({
        open: true,
        message: `❌ Không thể chuyển từ ${getStatusLabel(order.status)} sang ${getStatusLabel(newStatus)}`,
        severity: 'error',
      });
      return;
    }

    if (newStatus === 'SHIPPING') {
      setOpenShippingDialog(true);
      return;
    }

    try {
      setUpdatingStatus(true);
      await OrderApi.updateOrderStatus(orderId, newStatus);
      
      setOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      
      setSnackbar({
        open: true,
        message: `✅ Cập nhật trạng thái thành ${getStatusLabel(newStatus)}`,
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setSnackbar({
        open: true,
        message: `❌ ${err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái'}`,
        severity: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmShipping = async () => {
    if (!orderId || !order) return;

    try {
      setUpdatingStatus(true);
      await OrderApi.updateOrderStatus(orderId, 'SHIPPING');
      
      setOrder(prev => prev ? { ...prev, status: 'SHIPPING' as any } : null);
      setOpenShippingDialog(false);
      
      setSnackbar({
        open: true,
        message: `✅ Hàng đã được giao cho ĐVVC ${selectedShippingMethod}`,
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Error confirming shipping:', err);
      setSnackbar({
        open: true,
        message: `❌ ${err?.response?.data?.message || 'Lỗi khi xác nhận giao hàng'}`,
        severity: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    if (!order) return;
    
    const printElement = document.getElementById('order-print-template');
    if (printElement) {
      const printContainer = printElement.querySelector('.print-container');
      if (printContainer) {
        printOrderDetail(printContainer.outerHTML);
      }
    }
  };

  const handleOpenInvoiceMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (order?.invoices && order.invoices.length > 0) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleCloseInvoiceMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectInvoice = (invoiceId: number) => {
    navigate(`/admin/invoices/${invoiceId}`);
    handleCloseInvoiceMenu();
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
        const orderData = response.data;
        setOrder(orderData);
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
      setSnackbar({
        open: true,
        message: '✅ Huỷ đơn hàng thành công!',
        severity: 'success',
      });
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err: any) {
      console.error('Error canceling order:', err);
      setSnackbar({
        open: true,
        message: `❌ ${err?.response?.data?.message || 'Lỗi khi huỷ đơn hàng'}`,
        severity: 'error',
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleExportInvoice = async () => {
    if (!order || !orderId) return;

    if (order.invoices && order.invoices.length > 0) {
      navigate(`/admin/invoices/${order.invoices[0].id}`);
      return;
    }

    try {
      const response = await InvoiceApi.createFromOrder(orderId);
      const newInvoice = response.data;

      setSnackbar({
        open: true,
        message: '✅ Xuất hoá đơn thành công!',
        severity: 'success',
      });

      setTimeout(() => {
        navigate(`/admin/invoices/${newInvoice.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error creating invoice:', err);

      const errorMsg = err?.response?.data?.message || err.message || 'Lỗi khi tạo hoá đơn';
      setSnackbar({
        open: true,
        message: `❌ ${errorMsg}`,
        severity: 'error',
      });
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

  const subtotal = order.items ? order.items.reduce((sum: number, item: any) => sum + item.finalPrice * item.quantity, 0) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565c0', mb: 0.5 }}>
              📋 {order.orderCode}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', display: 'flex', gap: 1, alignItems: 'center' }}>
              <span>Khách: <strong style={{color: '#666'}}>{order.customerName}</strong></span>
              <span>•</span>
              <Chip label={getStatusLabel(order.status)} color={getStatusColor(order.status) as any} size="small" sx={{ml: 1}} />
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              startIcon={<PrintIcon />} 
              variant="contained" 
              onClick={handlePrint}
              sx={{ textTransform: 'none', backgroundColor: '#4CAF50' }}
            >
              In
            </Button>
            <Button 
              size="small"
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ textTransform: 'none' }}
            >
              Quay lại
            </Button>
          </Box>
        </Box>

        {/* Order Info & Shipping Info */}
        <Box className="order-print-area" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 2, mb: 3 }}>
          {/* Thông Tin Đơn Hàng */}
          <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, mb: 2, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 0.8 }}>
              ℹ️ THÔNG TIN ĐƠN HÀNG
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                  Khách hàng
                </Typography>
                <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: '14px' }}>
                  {order.customerName}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                  Trạng thái
                </Typography>
                <Chip 
                  size="small"
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status) as any}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                  Ngày tạo
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#666' }}>
                  📅 {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                  Mã đơn hàng
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#1976d2' }}>
                  {order.orderCode}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Thông Tin Giao Hàng */}
          <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #4CAF50' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, mb: 2.5, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 0.8 }}>
              🏠 THÔNG TIN GIAO HÀNG
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                  Người nhận
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
                  {order.receiverName || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                  Điện thoại
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
                  {order.receiverPhoneNumber || '—'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid #e8ebf0' }}>
              <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                Địa chỉ giao hàng
              </Typography>
              <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#333', lineHeight: 1.6, backgroundColor: '#f9f9f9', p: 1.5, borderRadius: 1 }}>
                📍 {order.shippingAddress || '—'}
              </Typography>
            </Box>
          </Paper>

          {/* Chi Tiết Sản Phẩm */}
          <Paper sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <Box sx={{ p: 3, pb: 0, borderBottom: '2px solid #f5f7fa' }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                🛍️ CHI TIẾT SẢN PHẨM
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #1976d2' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1565c0', fontSize: '12px', py: 1.5 }}>Tên hàng</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1565c0', fontSize: '12px', py: 1.5 }} align="center">Số lượng</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1565c0', fontSize: '12px', py: 1.5 }} align="right">Đơn giá</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1565c0', fontSize: '12px', py: 1.5 }} align="right">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item: any, index: number) => (
                      <TableRow 
                        key={index} 
                        sx={{ 
                          borderBottom: '1px solid #e8ebf0', 
                          '&:hover': { backgroundColor: '#f9fafb' },
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <TableCell sx={{ fontSize: '13px', py: 2 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#333' }}>{item.productName || 'Không rõ'}</Typography>
                          <Typography sx={{ fontSize: '11px', color: '#999', mt: 0.3, fontStyle: 'italic' }}>SKU: {item.sku}</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '13px', py: 2, fontWeight: 600 }}>
                          {item.quantity}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '13px', py: 2, fontWeight: 500 }}>
                          {formatCurrency(item.finalPrice)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '13px', py: 2, fontWeight: 700, color: '#1976d2' }}>
                          {formatCurrency(item.finalPrice * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#999', fontSize: '13px' }}>
                        Không có sản phẩm
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Summary & Actions */}
          <Paper sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 3 }}>
              {/* Breakdown */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 1.5, flex: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#999', fontWeight: 600, mb: 0.4 }}>Tổng tiền</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1976d2' }}>
                    {formatCurrency(subtotal)}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#999', fontWeight: 600, mb: 0.4 }}>Giảm giá</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: order.totalDiscount && order.totalDiscount > 0 ? '#f57c00' : '#999' }}>
                    {order.totalDiscount && order.totalDiscount > 0 ? `-${formatCurrency(order.totalDiscount)}` : formatCurrency(0)}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#999', fontWeight: 600, mb: 0.4 }}>Phí vận chuyển</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#666' }}>
                    {formatCurrency(0)}
                  </Typography>
                </Box>

                <Box sx={{ backgroundColor: '#1565c0', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '10px', color: '#e3f2fd', fontWeight: 600, mb: 0.3 }}>
                    TỔNG CỘNG
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>
                    {formatCurrency(order.total)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {/* Status Transition Buttons */}
              {order.status === 'PENDING' && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleUpdateOrderStatus('APPROVED')}
                    disabled={updatingStatus}
                    sx={{ textTransform: 'none' }}
                  >
                    ✓ Xác nhận
                  </Button>
                </>
              )}

              {order.status === 'APPROVED' && (
                <Button
                  size="small"
                  variant="contained"
                  color="info"
                  onClick={() => handleUpdateOrderStatus('PROCESSING')}
                  disabled={updatingStatus}
                  sx={{ textTransform: 'none' }}
                >
                  ▶ Chuẩn bị
                </Button>
              )}

              {order.status === 'PROCESSING' && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdateOrderStatus('SHIPPING')}
                  disabled={updatingStatus}
                  sx={{ textTransform: 'none' }}
                >
                  📦 Giao ĐVVC
                </Button>
              )}

              {order.status === 'SHIPPING' && (
                <>
                  {isAdminPanel ? (
                    // Admin: Confirm delivery button
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleUpdateOrderStatus('DELIVERED')}
                      disabled={updatingStatus}
                      sx={{ textTransform: 'none' }}
                    >
                      ✓ Xác nhận đã giao
                    </Button>
                  ) : (
                    // Customer: Mark as received button
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleUpdateOrderStatus('DELIVERED')}
                      disabled={updatingStatus}
                      sx={{ textTransform: 'none' }}
                    >
                      📦 Tôi đã nhận hàng
                    </Button>
                  )}
                </>
              )}

              {/* Invoice Buttons - Only show when DELIVERED */}
              {order.status === 'DELIVERED' && (
                <>
                  {order.invoices && order.invoices.length > 0 ? (
                    <>
                      <Button 
                        size="small"
                        variant="contained" 
                        color="success" 
                        startIcon={<VisibilityIcon />}
                        onClick={handleOpenInvoiceMenu}
                        sx={{ textTransform: 'none' }}
                      >
                        👁️ Xem HD ({order.invoices.length})
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseInvoiceMenu}
                      >
                        {order.invoices.map((invoice, idx) => (
                          <MenuItem key={idx} onClick={() => handleSelectInvoice(invoice.id)}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                              <Typography variant="body2" sx={{ fontWeight: '600' }}>
                                {invoice.invoiceCode}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString('vi-VN') : 'N/A'}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  ) : (
                    <Button 
                      size="small"
                      variant="contained" 
                      color="success" 
                      startIcon={<FileDownloadIcon />}
                      onClick={handleExportInvoice} 
                      sx={{ textTransform: 'none' }}
                    >
                      📥 Xuất HD
                    </Button>
                  )}
                </>
              )}

              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <Button 
                  size="small"
                  variant="contained" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenCancelDialog(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Huỷ
                </Button>
              )}

              <Button
                size="small"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ textTransform: 'none' }}
              >
                Quay lại
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Hidden Print Template */}
      <Box id="order-print-template" sx={{ display: 'none' }}>
        <OrderPrintTemplate order={order!} />
      </Box>

      {/* Shipping Method Dialog */}
      <Dialog open={openShippingDialog} onClose={() => setOpenShippingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1565c0', fontSize: '18px' }}>
          📦 Chọn Phương Thức Vận Chuyển
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Chọn ĐVVC</InputLabel>
            <Select
              label="Chọn ĐVVC"
              value={selectedShippingMethod}
              onChange={(e) => setSelectedShippingMethod(e.target.value)}
            >
              {SHIPPING_METHODS.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setOpenShippingDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmShipping}
            disabled={updatingStatus}
            sx={{ textTransform: 'none' }}
          >
            ✓ Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f', fontSize: '18px' }}>
          ⚠️ Huỷ Đơn Hàng
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: '#666', mb: 2 }}>
            Bạn có chắc chắn muốn huỷ đơn hàng <strong>{order?.orderCode}</strong> không?
          </Typography>
          <Typography sx={{ color: '#999', fontSize: '13px' }}>
            Hành động này không thể hoàn tác. Đơn hàng sẽ chuyển sang trạng thái "Đã huỷ".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setOpenCancelDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelOrder}
            disabled={canceling}
            sx={{ textTransform: 'none' }}
          >
            ✓ Xác nhận huỷ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderDetailScreen;
