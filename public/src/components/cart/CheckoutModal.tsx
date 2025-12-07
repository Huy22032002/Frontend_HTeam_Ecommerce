import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import type { CheckoutData } from '../../screens/cart/CartScreen.hook';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CheckoutData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  successMessage?: string | null;
  total: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  error,
  successMessage,
  total,
}) => {
  const [formData, setFormData] = useState<CheckoutData>({
    paymentMethod: 'CASH',
    notes: '',
    shippingAddress: '',
    receiverPhoneNumber: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
    if (!error) {
      setFormData({
        paymentMethod: 'CASH',
        notes: '',
        shippingAddress: '',
        receiverPhoneNumber: '',
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: 18 }}>
        Thanh toán đơn hàng
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {/* Tổng tiền */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: 1,
              border: '1px solid #ddd',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={600}>
                Tổng cộng:
              </Typography>
              <Typography variant="h6" fontWeight={600} color="#FF6B6B">
                {total.toLocaleString()}₫
              </Typography>
            </Stack>
          </Box>

          {/* Messages */}
          {error && (
            <Alert severity="error" onClose={() => {}}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" onClose={() => {}}>
              {successMessage}
            </Alert>
          )}

          {/* Phương thức thanh toán */}
          <FormControl fullWidth>
            <InputLabel>Phương thức thanh toán</InputLabel>
            <Select
              value={formData.paymentMethod}
              label="Phương thức thanh toán"
              onChange={handleSelectChange}
              disabled={isLoading}
            >
              <MenuItem value="CASH">Thanh toán bằng tiền mặt</MenuItem>
              <MenuItem value="TRANSFER">Chuyển khoản ngân hàng</MenuItem>
              <MenuItem value="CARD">Thẻ tín dụng/Ghi nợ</MenuItem>
              <MenuItem value="E_WALLET">Ví điện tử</MenuItem>
            </Select>
          </FormControl>

          {/* Địa chỉ giao hàng */}
          <TextField
            label="Địa chỉ giao hàng"
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
            placeholder="Nhập địa chỉ giao hàng chi tiết"
            disabled={isLoading}
            error={!formData.shippingAddress && formData.shippingAddress === ''}
            helperText={
              !formData.shippingAddress && formData.shippingAddress === ''
                ? 'Địa chỉ giao hàng không được bỏ trống'
                : ''
            }
          />

          {/* Số điện thoại người nhận */}
          <TextField
            label="Số điện thoại người nhận"
            name="receiverPhoneNumber"
            value={formData.receiverPhoneNumber}
            onChange={handleInputChange}
            fullWidth
            placeholder="Nhập số điện thoại"
            disabled={isLoading}
            error={!formData.receiverPhoneNumber && formData.receiverPhoneNumber === ''}
            helperText={
              !formData.receiverPhoneNumber && formData.receiverPhoneNumber === ''
                ? 'Số điện thoại không được bỏ trống'
                : ''
            }
          />

          {/* Ghi chú */}
          <TextField
            label="Ghi chú"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={2}
            placeholder="Nhập ghi chú (không bắt buộc)"
            disabled={isLoading}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{
            bgcolor: '#00CFFF',
            '&:hover': { bgcolor: '#00B8D4' },
          }}
        >
          {isLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} sx={{ color: '#fff' }} />
              <span>Đang xử lý...</span>
            </Stack>
          ) : (
            'Xác nhận thanh toán'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutModal;
