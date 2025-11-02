import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import type { RootState } from '../../store/store';
import { OrderApi } from '../../api/order/OrderApi';
import type { CreateOrderRequest } from '../../models/orders/CreateOrderRequest';
import type { PayOSCheckoutRequest } from '../../models/payments/PayOSPayment';
import { usePayOSCheckout } from '../../hooks/usePayOSCheckout';
import { formatCurrency } from '../../utils/formatCurrency';
import { VIETNAM_PROVINCES, getDistrictsByProvince } from '../../utils/vietnamAddresses';

/**
 * PayOS Checkout Screen
 * Separate checkout flow specifically for PayOS payment method
 * Does not affect existing payment methods
 */
export default function PayOSCheckoutScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redux state
  const cart = useSelector((state: RootState) => state.cart.cart);
  const customer = useSelector((state: RootState) => state.customerAuth?.customer);

  // PayOS checkout hook
  const {
    state: paymentState,
    initiatePayment,
    verifyPayment,
    retryPayment,
    resetState,
    redirectToCheckout,
  } = usePayOSCheckout();

  // Form state
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhoneNumber: '',
    notes: '',
  });

  // Address states
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState('');

  // UI states
  const [showQRModal, setShowQRModal] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderCreationError, setOrderCreationError] = useState<string | null>(null);

  // Get districts for selected province
  const availableDistricts = selectedProvince ? getDistrictsByProvince(selectedProvince) : [];

  // Check if redirected from PayOS
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success' || status === 'cancelled') {
      const orderCode = searchParams.get('orderCode');
      if (orderCode) {
        verifyPayment(parseInt(orderCode, 10));
      }
    }
  }, [searchParams, verifyPayment]);

  // Initialize form with customer data
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        receiverName: customer.name || '',
      }));
    }
  }, [customer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.receiverName.trim()) {
      setOrderCreationError('Vui lòng nhập họ và tên');
      return false;
    }
    if (!formData.receiverPhoneNumber.trim()) {
      setOrderCreationError('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!selectedProvince) {
      setOrderCreationError('Vui lòng chọn Tỉnh/Thành phố');
      return false;
    }
    if (!selectedDistrict) {
      setOrderCreationError('Vui lòng chọn Quận/Huyện');
      return false;
    }
    if (!streetAddress.trim()) {
      setOrderCreationError('Vui lòng nhập số nhà, đường phố');
      return false;
    }
    if (!cart?.items || cart.items.length === 0) {
      setOrderCreationError('Giỏ hàng trống');
      return false;
    }
    return true;
  };

  const handleInitiatePayOSPayment = async () => {
    if (!validateForm()) {
      return;
    }

    if (!customer?.id) {
      setOrderCreationError('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    try {
      setIsProcessingOrder(true);
      setOrderCreationError(null);

      // Build full address
      const provinceName = VIETNAM_PROVINCES.find((p) => p.id === selectedProvince)?.name || '';
      const districtName = availableDistricts.find((d) => d.id === selectedDistrict)?.name || '';

      const fullAddress = [streetAddress, districtName, provinceName].filter(Boolean).join(', ');

      // Calculate subtotal
      const subtotal =
        cart?.items?.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0) || 0;

      // Convert cart items to order items
      const items = (cart?.items || []).map((item) => ({
        variantId: item.optionId,
        productVariantOptionId: item.optionId,
        sku: item.sku,
        quantity: item.quantity,
        price: item.currentPrice,
      }));

      const orderRequest: CreateOrderRequest = {
        customerId: customer.id,
        items,
        paymentMethod: 'TRANSFER', // Use TRANSFER as placeholder for PayOS
        notes: formData.notes || '',
        shippingAddress: fullAddress,
        receiverPhoneNumber: formData.receiverPhoneNumber,
        totalAmount: subtotal,
        customerCartCode: cart?.cartCode || '',
      };

      // Create order
      const orderResponse = await OrderApi.createByCustomer(orderRequest as any);

      if (!orderResponse.data?.id && !orderResponse.data?.data?.id) {
        throw new Error('Failed to create order');
      }

      const orderId = orderResponse.data?.id || orderResponse.data?.data?.id;
      const orderCode = orderResponse.data?.orderCode || String(orderId);

      // Prepare PayOS payment request
      const payosRequest: PayOSCheckoutRequest = {
        orderId: Number(orderId),
        orderCode: String(orderCode),
        amount: subtotal,
        description: `Thanh toán đơn hàng ${orderCode}`,
        returnUrl: `${window.location.origin}/payos-checkout?status=success&orderCode=${orderId}`,
        cancelUrl: `${window.location.origin}/payos-checkout?status=cancelled&orderCode=${orderId}`,
        buyerName: formData.receiverName,
        buyerPhone: formData.receiverPhoneNumber,
        buyerAddress: fullAddress,
        items: cart?.items
          ?.filter((item) => item.productName)
          ?.map((item) => ({
            name: item.productName || 'Sản phẩm',
            quantity: item.quantity,
            price: item.currentPrice,
          })),
      };

      // Initiate PayOS payment
      await initiatePayment(payosRequest);

      // Show QR modal or redirect based on payment method
      setShowQRModal(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng';
      setOrderCreationError(errorMessage);
      console.error('PayOS checkout error:', err);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (paymentState.checkoutUrl) {
      setShowQRModal(false);
      redirectToCheckout(paymentState.checkoutUrl);
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
  };

  const handleRetryPayment = async () => {
    if (paymentState.paymentState?.orderId) {
      await retryPayment(paymentState.paymentState.orderId);
    }
  };

  // Calculate subtotal
  const subtotal =
    cart?.items?.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0) || 0;

  // Show success state
  if (paymentState.success && paymentState.paymentState?.status === 'COMPLETED') {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
          <Card sx={{ borderRadius: 2, textAlign: 'center', p: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: '#4caf50' }}>
              ✅ Thanh toán thành công!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ xử lý và gửi hàng cho bạn sớm nhất.
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Mã đơn hàng: <strong>{paymentState.paymentState?.orderCode}</strong>
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/order-history')}
              sx={{ bgcolor: '#00CFFF', textTransform: 'none' }}
            >
              Xem lịch sử đơn hàng
            </Button>
          </Card>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (paymentState.paymentState?.status === 'FAILED' || paymentState.paymentState?.status === 'CANCELLED') {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
          <Card sx={{ borderRadius: 2, textAlign: 'center', p: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: '#f44336' }}>
              ❌ Thanh toán thất bại
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {paymentState.error || 'Thanh toán không thành công. Vui lòng thử lại.'}
            </Typography>
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleRetryPayment}
                disabled={paymentState.loading}
                sx={{ bgcolor: '#00CFFF', textTransform: 'none' }}
              >
                {paymentState.loading ? <CircularProgress size={20} /> : 'Thử lại'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/checkout')}
                disabled={paymentState.loading}
              >
                Quay lại giỏ hàng
              </Button>
            </Stack>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        sx={{ px: { xs: 2, sm: 4, md: 6, lg: 20 }, maxWidth: '1400px', mx: 'auto' }}
        alignItems="flex-start"
      >
        {/* LEFT FORM */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Alerts */}
          {orderCreationError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setOrderCreationError(null)}>
              {orderCreationError}
            </Alert>
          )}
          {paymentState.error && (
            <Alert severity="warning" sx={{ mb: 3 }} onClose={() => resetState()}>
              {paymentState.error}
            </Alert>
          )}

          {/* Shipping Information Card */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                🏠 Thông tin giao hàng
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Họ và tên người nhận"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                  disabled={isProcessingOrder || paymentState.isProcessing}
                />

                {/* Province & District Row */}
                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                  {/* Province Selection */}
                  <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: '#666' }}>Tỉnh/Thành Phố</InputLabel>
                    <Select
                      label="Tỉnh/Thành Phố"
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value as string);
                        setSelectedDistrict('');
                      }}
                      disabled={isProcessingOrder || paymentState.isProcessing}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>-- Chọn Tỉnh/Thành Phố --</em>
                      </MenuItem>
                      {VIETNAM_PROVINCES.map((province) => (
                        <MenuItem key={province.id} value={province.id}>
                          {province.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* District Selection */}
                  <FormControl fullWidth size="small" disabled={!selectedProvince || isProcessingOrder || paymentState.isProcessing} sx={{ flex: 1 }}>
                    <InputLabel>Quận/Huyện</InputLabel>
                    <Select
                      label="Quận/Huyện"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value as string)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>-- Chọn Quận/Huyện --</em>
                      </MenuItem>
                      {availableDistricts.map((district) => (
                        <MenuItem key={district.id} value={district.id}>
                          {district.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Street Address */}
                <TextField
                  fullWidth
                  size="small"
                  label="Số nhà, đường phố"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="VD: 123 Đường ABC"
                  disabled={isProcessingOrder || paymentState.isProcessing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />

                {/* Phone Number */}
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="receiverPhoneNumber"
                  value={formData.receiverPhoneNumber}
                  onChange={handleInputChange}
                  placeholder="VD: 0987654321"
                  type="tel"
                  disabled={isProcessingOrder || paymentState.isProcessing}
                />

                {/* Display full address preview */}
                {selectedProvince && selectedDistrict && (
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: '#e3f2fd',
                      borderRadius: 1,
                      border: '1px solid #90caf9',
                      boxShadow: '0 2px 4px rgba(25, 118, 210, 0.1)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: '600' }}>
                      ✓ Địa chỉ giao hàng:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: '#1565c0', fontWeight: '500' }}>
                      {streetAddress ? `${streetAddress}, ` : ''}
                      {VIETNAM_PROVINCES.find((p) => p.id === selectedProvince)?.name},
                      {availableDistricts.find((d) => d.id === selectedDistrict)?.name}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Payment Method Info Card */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                💳 Phương thức thanh toán
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: '#f0f7ff',
                  borderRadius: 1,
                  border: '2px solid #1976d2',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1565c0' }}>
                  🏦 Thanh toán qua PayOS
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Quét mã QR hoặc nhấn "Thanh toán ngay" để chuyển đến trang thanh toán PayOS
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                📝 Ghi chú (tùy chọn)
              </Typography>
              <TextField
                fullWidth
                label="Ghi chú đơn hàng"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)"
                disabled={isProcessingOrder || paymentState.isProcessing}
              />
            </CardContent>
          </Card>
        </Box>

        {/* RIGHT SUMMARY */}
        <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 2, position: { md: 'sticky' }, top: { md: 20 } }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                📦 Tóm tắt đơn hàng
              </Typography>

              {/* Cart Items Preview */}
              <Box sx={{ mb: 2, maxHeight: 300, overflowY: 'auto' }}>
                {(cart?.items || []).map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1.5,
                      pb: 1.5,
                      borderBottom: '1px solid #eee',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        x{item.quantity}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500} sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                      {formatCurrency(item.currentPrice * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Pricing Summary */}
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Tạm tính
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatCurrency(subtotal)}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Phí vận chuyển
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color="textSecondary">
                    Miễn phí
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Total */}
              <Box
                display="flex"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  bgcolor: '#e3f2fd',
                  borderRadius: 1,
                  border: '2px solid #1976d2',
                  mb: 2,
                }}
              >
                <Typography fontWeight="bold" color="#1565c0">
                  Tổng cộng
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#1565c0">
                  {formatCurrency(subtotal)}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/cart')}
                  disabled={isProcessingOrder || paymentState.isProcessing}
                  sx={{ textTransform: 'none' }}
                >
                  ← Quay lại giỏ hàng
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleInitiatePayOSPayment}
                  disabled={isProcessingOrder || paymentState.isProcessing || (cart?.items?.length || 0) === 0}
                  sx={{
                    bgcolor: '#00CFFF',
                    textTransform: 'none',
                    borderRadius: 1,
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#00B8D4' },
                  }}
                >
                  {isProcessingOrder || paymentState.isProcessing ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} sx={{ color: '#fff' }} />
                      <span>Đang xử lý...</span>
                    </Stack>
                  ) : (
                    `✅ Thanh toán qua PayOS (${cart?.items?.length || 0} sản phẩm)`
                  )}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* QR Code / Checkout Modal */}
      <Dialog open={showQRModal} onClose={handleCloseQRModal} maxWidth="sm" fullWidth>
        <DialogTitle>Thông tin thanh toán PayOS</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {paymentState.paymentState?.qrCode && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'textSecondary' }}>
                  Quét mã QR để thanh toán:
                </Typography>
                <img
                  src={paymentState.paymentState.qrCode}
                  alt="QR Code"
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                />
              </Box>
            )}
            <Divider />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Số tiền thanh toán:
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#00CFFF' }}>
                {formatCurrency(paymentState.paymentState?.amount || subtotal)}
              </Typography>
            </Box>
            <Alert severity="info">
              Sau khi thanh toán thành công, bạn sẽ được chuyển hướng trở lại để xác nhận đơn hàng.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQRModal} disabled={paymentState.loading}>
            Hủy
          </Button>
          <Button
            onClick={handleProceedToCheckout}
            variant="contained"
            disabled={paymentState.loading || !paymentState.checkoutUrl}
            sx={{ bgcolor: '#00CFFF', textTransform: 'none' }}
          >
            {paymentState.loading ? <CircularProgress size={20} /> : 'Thanh toán ngay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
