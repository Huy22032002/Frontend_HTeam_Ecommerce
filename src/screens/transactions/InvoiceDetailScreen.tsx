import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
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
  Paper,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from 'react-router-dom';
import { InvoiceApi } from '../../api/invoice/InvoiceApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { printInvoiceDetail } from '../../utils/printUtils';
import InvoicePrintTemplate from '../../components/print/InvoicePrintTemplate';

interface InvoiceDetail {
  id: number;
  invoiceCode: string;
  customerName: string;
  receiverName: string;
  receiverPhoneNumber: string;
  shippingAddress: string;
  total: number;
  totalDiscount: number;
  tax: number;
  status: string;
  type: string;
  note: string;
  invoiceDate: string;
  orderId: number;
  orderCode: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: number;
  sku: string;
  productName: string;
  quantity: number;
  finalPrice: number;
}

const InvoiceDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams<{ invoiceId: string }>();

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setError('Không tìm thấy ID hoá đơn');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await InvoiceApi.getDetail(invoiceId);
        setInvoice(response.data);
      } catch (err: any) {
        console.error('Error fetching invoice:', err);
        setError(err?.response?.data?.message || 'Lỗi khi lấy chi tiết hoá đơn');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    const printElement = document.getElementById('invoice-print-template');
    if (printElement) {
      const printContainer = printElement.querySelector('.print-container');
      if (printContainer) {
        printInvoiceDetail(printContainer.outerHTML);
      }
    }
  };

  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  const handleCancelInvoice = async () => {
    if (!invoiceId) return;

    try {
      setCanceling(true);
      await InvoiceApi.cancel(invoiceId);

      setSnackbar({
        open: true,
        message: '✅ Huỷ hoá đơn thành công!',
        severity: 'success',
      });

      handleCloseCancelDialog();

      // Refresh invoice data
      setTimeout(() => {
        const fetchInvoice = async () => {
          try {
            const response = await InvoiceApi.getDetail(invoiceId);
            setInvoice(response.data);
          } catch (err) {
            console.error('Error refreshing invoice:', err);
          }
        };
        fetchInvoice();
      }, 1500);
    } catch (err: any) {
      console.error('Error canceling invoice:', err);
      setSnackbar({
        open: true,
        message: `❌ ${err?.response?.data?.message || 'Lỗi khi huỷ hoá đơn'}`,
        severity: 'error',
      });
    } finally {
      setCanceling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'info';
      case 'PAID':
        return 'success';
      case 'SHIPPED':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'Vừa tạo';
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

  if (error || !invoice) {
    return (
      <Container maxWidth={false} sx={{ py: 4, minHeight: '100vh' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>Quay lại</Button>
        <Alert severity="error">{error || 'Không tìm thấy hoá đơn'}</Alert>
      </Container>
    );
  }

  const totalItems = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = invoice.items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565c0', mb: 0.5 }}>
              📄 {invoice.invoiceCode}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', display: 'flex', gap: 1 }}>
              <span>Mã đơn: <strong style={{color: '#666'}}>{invoice.orderCode}</strong></span>
              <span>•</span>
              <span>Ngày: <strong style={{color: '#666'}}>{new Date(invoice.invoiceDate).toLocaleDateString('vi-VN')}</strong></span>
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

        {/* Content Grid */}
        <Box className="invoice-print-area" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 2, mb: 3 }}>
          {/* Left: Thông Tin & Giao Hàng */}
          <Box>
            {/* Thông Tin Hoá Đơn */}
            <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, mb: 2, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                ℹ️ THÔNG TIN HOÁ ĐƠN
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                    Khách hàng
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: '14px' }}>
                    {invoice.customerName}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                    Loại hoá đơn
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#666' }}>
                    {invoice.type === 'SALES' ? '📋 Bán hàng' : invoice.type}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                    Trạng thái
                  </Typography>
                  <Chip 
                    size="small"
                    label={getStatusLabel(invoice.status)}
                    color={getStatusColor(invoice.status) as any}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                    Ngày tạo
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#666' }}>
                    📅 {new Date(invoice.invoiceDate).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              </Box>
              {invoice.note && (
                <>
                  <Divider sx={{ my: 2.5 }} />
                  <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                    Ghi chú
                  </Typography>
                  <Typography sx={{ fontSize: '13px', fontStyle: 'italic', color: '#555', backgroundColor: '#fafafa', p: 1.5, borderRadius: 1, borderLeft: '3px solid #1976d2' }}>
                    💬 {invoice.note}
                  </Typography>
                </>
              )}
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
                    {invoice.receiverName || '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                    Điện thoại
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
                    {invoice.receiverPhoneNumber || '—'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid #e8ebf0' }}>
                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                  Địa chỉ giao hàng
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#333', lineHeight: 1.6, backgroundColor: '#f9f9f9', p: 1.5, borderRadius: 1 }}>
                  📍 {invoice.shippingAddress || '—'}
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
                      <TableCell sx={{ fontWeight: 700, color: '#1565c0', fontSize: '12px', py: 1.5 }} align="center">SL</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1565c0', fontSize: '12px', py: 1.5 }} align="right">Đơn giá</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1565c0', fontSize: '12px', py: 1.5 }} align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <TableRow 
                          key={index} 
                          sx={{ 
                            borderBottom: '1px solid #e8ebf0', 
                            '&:hover': { backgroundColor: '#f9fafb' },
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <TableCell sx={{ fontSize: '13px', py: 2 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#333' }}>{item.sku}</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#999', mt: 0.3 }}>{item.productName}</Typography>
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
          </Box>
        </Box>
      </Container>

      {/* Sticky Footer - Summary */}
      <Paper
        elevation={3}
        sx={{
          position: 'sticky',
          bottom: 0,
          p: 3,
          px: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#f8fafc',
          borderTop: '3px solid #1976d2',
          zIndex: 100,
          boxSizing: 'border-box',
          mt: 'auto',
        }}
      >
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr auto' }, gap: 3, alignItems: 'center' }}>
            {/* Left: Item Count */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ textAlign: 'center', backgroundColor: 'white', p: 1.5, borderRadius: 1, minWidth: '80px', border: '1px solid #e0e0e0' }}>
                <Typography sx={{ fontSize: '11px', color: '#999', fontWeight: 600, mb: 0.3 }}>
                  TỔNG HÀNG
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#1976d2' }}>
                  {totalItems}
                </Typography>
              </Box>
            </Box>

            {/* Center: Breakdown */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 1.5, px: 2, py: 1.5, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              {/* Tổng tiền hàng */}
              <Box>
                <Typography sx={{ fontSize: '11px', color: '#999', fontWeight: 600, mb: 0.4 }}>Tổng tiền</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1976d2' }}>
                  {formatCurrency(subtotal)}
                </Typography>
                <Typography sx={{ fontSize: '9px', color: '#ccc', mt: 0.3, fontStyle: 'italic' }}>
                  (Giá đã bao gồm VAT)
                </Typography>
              </Box>

              {/* Tổng giảm giá */}
              <Box>
                <Typography sx={{ fontSize: '11px', color: '#999', fontWeight: 600, mb: 0.4 }}>Giảm giá</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: invoice.totalDiscount && invoice.totalDiscount > 0 ? '#f57c00' : '#999' }}>
                  {invoice.totalDiscount && invoice.totalDiscount > 0 ? `-${formatCurrency(invoice.totalDiscount)}` : formatCurrency(0)}
                </Typography>
              </Box>

              {/* Phí vận chuyển */}
              <Box>
                <Typography sx={{ fontSize: '11px', color: '#999', fontWeight: 600, mb: 0.4 }}>Phí vận chuyển</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#666' }}>
                  {formatCurrency(0)}
                </Typography>
              </Box>
            </Box>

            {/* Right: Total & Actions */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {/* Total Box */}
              <Box sx={{ backgroundColor: '#1565c0', p: 2.5, borderRadius: 1.5, textAlign: 'center', minWidth: '160px', boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)', border: '2px solid #0d47a1' }}>
                <Typography sx={{ fontSize: '10px', color: '#e3f2fd', fontWeight: 600, mb: 0.5, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  TỔNG CỘNG
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '22px', color: '#fff', lineHeight: 1.2 }}>
                  {formatCurrency(invoice.total)}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ textTransform: 'none', backgroundColor: '#4CAF50', whiteSpace: 'nowrap', '&:hover': { backgroundColor: '#45a049' } }}
                >
                  In
                </Button>
                {invoice.status !== 'CANCELLED' && (
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleOpenCancelDialog}
                    sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                  >
                    Huỷ
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  Quay lại
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Hidden Print Template */}
      <Box id="invoice-print-template" sx={{ display: 'none' }}>
        <InvoicePrintTemplate invoice={invoice!} />
      </Box>

      {/* Cancel Invoice Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f', fontSize: '18px' }}>
          ⚠️ Huỷ Hoá Đơn
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: '#666', mb: 2 }}>
            Bạn có chắc chắn muốn huỷ hoá đơn <strong>{invoice?.invoiceCode}</strong> không?
          </Typography>
          <Typography sx={{ color: '#999', fontSize: '13px' }}>
            Hành động này không thể hoàn tác. Hoá đơn sẽ chuyển sang trạng thái "Đã huỷ".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCloseCancelDialog}
            sx={{ textTransform: 'none' }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelInvoice}
            disabled={canceling}
            sx={{ textTransform: 'none' }}
          >
            {canceling ? 'Đang xử lý...' : 'Xác nhận huỷ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        message={snackbar.message}
      />
    </Box>
);
};

export default InvoiceDetailScreen;
