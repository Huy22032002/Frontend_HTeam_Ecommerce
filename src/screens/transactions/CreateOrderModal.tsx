import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Typography,
  Stepper,
  Step,
  StepLabel,
  type SelectChangeEvent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';
import { OrderApi } from '../../api/order/OrderApi';

interface OrderItem {
  productVariantId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [customerId, setCustomerId] = useState<string>('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state cho thêm sản phẩm
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

  const { customers } = useCustomers();
  const { products } = useProducts();

  const handleCustomerChange = (e: SelectChangeEvent) => {
    setCustomerId(e.target.value);
  };

  const handleProductChange = (e: SelectChangeEvent) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    // Auto-fill price từ sản phẩm được chọn
    const product = products.find(p => p.id === parseInt(productId));
    if (product && product.variants && product.variants[0]) {
      setPrice(product.variants[0]. || 0);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || price <= 0) {
      alert('Vui lòng điền đầy đủ thông tin sản phẩm');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    const newItem: OrderItem = {
      productVariantId: parseInt(selectedProduct),
      productName: product.productName || 'Product @',
      quantity,
      price,
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setQuantity(1);
    setPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (activeStep === 0 && !customerId) {
      alert('Vui lòng chọn khách hàng');
      return;
    }
    if (activeStep === 1 && items.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const orderData = {
        customerId: parseInt(customerId),
        items: items.map(item => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
        })),
        notes,
        shippingAddress,
      };

      await OrderApi.create(orderData);
      alert('Tạo đơn hàng thành công!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Lỗi tạo đơn hàng:', error);
      alert('Lỗi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setCustomerId('');
    setItems([]);
    setNotes('');
    setShippingAddress('');
    setSelectedProduct('');
    setQuantity(1);
    setPrice(0);
    onClose();
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Tạo Đơn Hàng Mới</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>Chọn Khách Hàng</StepLabel>
          </Step>
          <Step>
            <StepLabel>Chọn Sản Phẩm</StepLabel>
          </Step>
          <Step>
            <StepLabel>Thông Tin Giao Hàng</StepLabel>
          </Step>
          <Step>
            <StepLabel>Xác Nhận</StepLabel>
          </Step>
        </Stepper>

        {/* Step 0: Chọn khách hàng */}
        {activeStep === 0 && (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Khách hàng</InputLabel>
              <Select
                value={customerId}
                label="Khách hàng"
                onChange={handleCustomerChange}
              >
                {customers.map(customer => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {customerId && (
              <Typography variant="body2" color="textSecondary">
                ✓ Đã chọn khách hàng
              </Typography>
            )}
          </Box>
        )}

        {/* Step 1: Chọn sản phẩm */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Thêm Sản Phẩm</Typography>
            <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Sản phẩm</InputLabel>
                <Select
                  value={selectedProduct}
                  label="Sản phẩm"
                  onChange={handleProductChange}
                >
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Số lượng"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                sx={{ mb: 2 }}
                inputProps={{ min: 1 }}
              />

              <TextField
                fullWidth
                label="Giá"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                sx={{ mb: 2 }}
                inputProps={{ min: 0, step: 1000 }}
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                fullWidth
              >
                Thêm Sản Phẩm
              </Button>
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>Sản Phẩm Đã Chọn</Typography>
            {items.length === 0 ? (
              <Typography color="textSecondary">Chưa có sản phẩm nào</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tên Sản Phẩm</TableCell>
                    <TableCell align="right">Số Lượng</TableCell>
                    <TableCell align="right">Giá</TableCell>
                    <TableCell align="right">Thành Tiền</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.price.toLocaleString()}₫</TableCell>
                      <TableCell align="right">{(item.quantity * item.price).toLocaleString()}₫</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(index)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {/* Step 2: Thông tin giao hàng */}
        {activeStep === 2 && (
          <Box>
            <TextField
              fullWidth
              label="Địa chỉ giao hàng"
              multiline
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Ghi chú"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>
        )}

        {/* Step 3: Xác nhận */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Thông Tin Đơn Hàng</Typography>
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography><strong>Khách hàng:</strong> {customers.find(c => c.id === parseInt(customerId))?.name}</Typography>
              <Typography><strong>Số lượng sản phẩm:</strong> {items.length}</Typography>
              <Typography><strong>Tổng tiền:</strong> {totalAmount.toLocaleString()}₫</Typography>
              <Typography><strong>Địa chỉ giao:</strong> {shippingAddress || 'Chưa cập nhật'}</Typography>
              {notes && <Typography><strong>Ghi chú:</strong> {notes}</Typography>}
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sản Phẩm</TableCell>
                  <TableCell align="right">SL</TableCell>
                  <TableCell align="right">Giá</TableCell>
                  <TableCell align="right">Thành Tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.price.toLocaleString()}₫</TableCell>
                    <TableCell align="right">{(item.quantity * item.price).toLocaleString()}₫</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Đóng</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>Quay Lại</Button>
        )}
        {activeStep < 3 && (
          <Button onClick={handleNext} variant="contained">
            Tiếp Theo
          </Button>
        )}
        {activeStep === 3 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Tạo Đơn Hàng'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrderModal;
