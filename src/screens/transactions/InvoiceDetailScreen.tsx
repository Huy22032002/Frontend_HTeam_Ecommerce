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
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate, useParams } from 'react-router-dom';
import { InvoiceApi } from '../../api/invoice/InvoiceApi';
import { formatCurrency } from '../../utils/formatCurrency';

interface InvoiceDetail {
  id: number;
  invoiceCode: string;
  customerName: string;
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
    window.print();
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
    <Container maxWidth={false} sx={{ py: 4, backgroundColor: '#f8f9fa', minHeight: '100vh', px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>📄 Chi Tiết Hoá Đơn</Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>Mã hoá đơn: {invoice.invoiceCode}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<PrintIcon />} variant="contained" onClick={handlePrint} sx={{ textTransform: 'none', px: 3 }}>In Hoá Đơn</Button>
          <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate(-1)} sx={{ textTransform: 'none', px: 3 }}>Quay Lại</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Left */}
        <Box>
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardHeader title="📋 Thông Tin Hoá Đơn" sx={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e8ebf0' }} />
            <CardContent sx={{ pt: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Mã hoá đơn</Typography>
                  <Typography variant="h6" sx={{ fontWeight: '600', color: '#1976d2' }}>{invoice.invoiceCode}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Mã đơn hàng</Typography>
                  <Typography variant="h6" sx={{ fontWeight: '600', color: '#1976d2' }}>{invoice.orderCode}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Khách hàng</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>{invoice.customerName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Trạng thái</Typography>
                  <Chip label={getStatusLabel(invoice.status)} color={getStatusColor(invoice.status) as any} variant="filled" />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Ngày lập</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>{new Date(invoice.invoiceDate).toLocaleString('vi-VN')}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Loại</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>{invoice.type}</Typography>
                </Box>
              </Box>
              {invoice.note && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>Ghi chú</Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{invoice.note}</Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardHeader title="🏠 Địa chỉ giao hàng" sx={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e8ebf0' }} />
            <CardContent sx={{ pt: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: '500' }}>{invoice.shippingAddress || 'Chưa có thông tin'}</Typography>
            </CardContent>
          </Card>

          {/* Items */}
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardHeader title="🛍️ Chi Tiết Sản Phẩm" sx={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #e8ebf0' }} />
            <CardContent sx={{ pt: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f0f2f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#1976d2' }}>Sản Phẩm</TableCell>
                      <TableCell align="center" sx={{ fontWeight: '600', color: '#1976d2' }}>SL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '600', color: '#1976d2' }}>Đơn giá</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '600', color: '#1976d2' }}>Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <TableRow key={index} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: '600' }}>SKU: {item.sku}</Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>{item.productName}</Typography>
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
            <CardHeader title="💰 Tóm Tắt Hoá Đơn" sx={{ backgroundColor: '#1976d2', color: 'white' }} />
            <CardContent sx={{ pt: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>Tổng sản phẩm:</Typography>
                <Typography variant="body2" sx={{ fontWeight: '600' }}>{totalItems} cái</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>Tổng tiền hàng:</Typography>
                <Typography variant="body2" sx={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</Typography>
              </Box>
              {invoice.totalDiscount && invoice.totalDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Chiết khấu:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '600', color: 'error.main' }}>-{formatCurrency(invoice.totalDiscount)}</Typography>
                </Box>
              )}
              {invoice.tax && invoice.tax > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Thuế VAT:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: '600' }}>{formatCurrency(invoice.tax)}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, border: '2px solid #1976d2' }}>
                <Typography variant="h6" sx={{ fontWeight: '600', color: '#1565c0' }}>TỔNG CỘNG:</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565c0' }}>{formatCurrency(invoice.total)}</Typography>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button fullWidth variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ textTransform: 'none', py: 1.2, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}>🖨️ In Hoá Đơn</Button>
                <Button fullWidth variant="outlined" onClick={() => navigate(-1)} sx={{ textTransform: 'none', py: 1.2 }}>← Quay Lại</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default InvoiceDetailScreen;
