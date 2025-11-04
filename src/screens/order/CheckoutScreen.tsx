import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
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
} from "@mui/material";
import type { RootState } from "../../store/store";
import { OrderApi } from "../../api/order/OrderApi";
import type { CreateOrderRequest } from "../../models/orders/CreateOrderRequest";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  VIETNAM_PROVINCES,
  getDistrictsByProvince,
} from "../../utils/vietnamAddresses";

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const cart = useSelector((state: RootState) => state.cart.cart);
  const customer = useSelector(
    (state: RootState) => state.customerAuth?.customer
  );

  // Lấy sản phẩm từ "Mua ngay"
  const directProduct = (location.state as any)?.directProduct;

  // Form state
  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhoneNumber: "",
    shippingAddress: "",
    notes: "",
    paymentMethod: "CASH" as "CASH" | "TRANSFER" | "CARD" | "E_WALLET",
  });

  // Address states
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState("");

  // Get districts for selected province
  const availableDistricts = selectedProvince
    ? getDistrictsByProvince(selectedProvince)
    : [];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form with customer data
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        receiverName: customer.name || "",
      }));
    }
  }, [customer]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: e.target.value as
        | "CASH"
        | "TRANSFER"
        | "CARD"
        | "E_WALLET",
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.receiverName.trim()) {
      setError("Vui lòng nhập họ và tên");
      return false;
    }
    if (!formData.receiverPhoneNumber.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!selectedProvince) {
      setError("Vui lòng chọn Tỉnh/Thành phố");
      return false;
    }
    if (!selectedDistrict) {
      setError("Vui lòng chọn Quận/Huyện");
      return false;
    }
    if (!streetAddress.trim()) {
      setError("Vui lòng nhập số nhà, đường phố");
      return false;
    }
    // Kiểm tra giỏ hàng hoặc sản phẩm mua ngay
    if (!directProduct && (!cart?.items || cart.items.length === 0)) {
      setError("Giỏ hàng trống");
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (!customer?.id) {
      setError("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Build full address from province, district, and street
      const provinceName =
        VIETNAM_PROVINCES.find((p) => p.id === selectedProvince)?.name || "";
      const districtName =
        availableDistricts.find((d) => d.id === selectedDistrict)?.name || "";

      const fullAddress = [streetAddress, districtName, provinceName]
        .filter(Boolean)
        .join(", ");

<<<<<<< HEAD
      // Chuyển đổi cart items thành order items
      const items = (cart?.items || []).map((item) => ({
        variantId: item.optionId,
        productVariantOptionId: item.optionId,
        sku: item.sku,
        quantity: item.quantity,
        price: item.currentPrice,
      }));
=======
      // Chuyển đổi cart items thành order items hoặc sử dụng sản phẩm từ "Mua ngay"
      let items;
      let totalAmount;

      if (directProduct) {
        // Từ "Mua ngay" - không gửi customerCartCode
        items = [{
          variantId: directProduct.optionId,
          productVariantOptionId: directProduct.optionId,
          sku: directProduct.sku,
          quantity: directProduct.quantity,
          price: directProduct.currentPrice,
        }];
        totalAmount = directProduct.currentPrice * directProduct.quantity;
      } else {
        // Từ giỏ hàng
        items = (cart?.items || []).map(item => ({
          variantId: item.optionId,
          productVariantOptionId: item.optionId,
          sku: item.sku,
          quantity: item.quantity,
          price: item.currentPrice,
        }));
        totalAmount = subtotal;
      }
>>>>>>> origin/dev

      const orderRequest: CreateOrderRequest = {
        customerId: customer.id,
        items,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || "",
        shippingAddress: fullAddress,
        receiverPhoneNumber: formData.receiverPhoneNumber,
        totalAmount,
        ...(directProduct ? {} : { customerCartCode: cart?.cartCode || "" }),
      };

      const response = await OrderApi.createByCustomer(orderRequest as any);

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("✅ Tạo đơn hàng thành công!");

        // Chuyển hướng sau 2 giây
        setTimeout(() => {
          navigate("/order-history", { replace: true });
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi tạo đơn hàng";
      setError(errorMessage);
      console.error("Checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tính tổng tiền
  const subtotal = directProduct 
    ? directProduct.currentPrice * directProduct.quantity
    : (cart?.items?.reduce(
        (sum, item) => sum + item.currentPrice * item.quantity,
        0
      ) || 0);

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 4 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        sx={{
          px: { xs: 2, sm: 4, md: 6, lg: 20 },
          maxWidth: "1400px",
          mx: "auto",
        }}
        alignItems="flex-start"
      >
        {/* LEFT FORM */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Alerts */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert
              severity="success"
              sx={{ mb: 3 }}
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
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
                  disabled={isLoading}
                />

                {/* Province & District Row */}
                <Box
                  sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}
                >
                  {/* Province Selection */}
                  <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: "#666" }}>
                      Tỉnh/Thành Phố
                    </InputLabel>
                    <Select
                      label="Tỉnh/Thành Phố"
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value as string);
                        setSelectedDistrict("");
                      }}
                      disabled={isLoading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "#1976d2",
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
                  <FormControl
                    fullWidth
                    size="small"
                    disabled={!selectedProvince || isLoading}
                    sx={{ flex: 1 }}
                  >
                    <InputLabel>Quận/Huyện</InputLabel>
                    <Select
                      label="Quận/Huyện"
                      value={selectedDistrict}
                      onChange={(e) =>
                        setSelectedDistrict(e.target.value as string)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "#1976d2",
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
                  disabled={isLoading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
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
                  disabled={isLoading}
                />

                {/* Display full address preview */}
                {selectedProvince && selectedDistrict && (
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: "#e3f2fd",
                      borderRadius: 1,
                      border: "1px solid #90caf9",
                      boxShadow: "0 2px 4px rgba(25, 118, 210, 0.1)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#1565c0", fontWeight: "600" }}
                    >
                      ✓ Địa chỉ giao hàng:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.5, color: "#1565c0", fontWeight: "500" }}
                    >
                      {streetAddress ? `${streetAddress}, ` : ""}
                      {
                        VIETNAM_PROVINCES.find((p) => p.id === selectedProvince)
                          ?.name
                      }
                      ,
                      {
                        availableDistricts.find(
                          (d) => d.id === selectedDistrict
                        )?.name
                      }
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Payment Method Card */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                💳 Phương thức thanh toán
              </Typography>

              <RadioGroup
                value={formData.paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel
                  value="TRANSFER"
                  control={<Radio />}
                  label="🏦 Chuyển khoản ngân hàng"
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="CARD"
                  control={<Radio />}
                  label="💳 Thẻ tín dụng / Ghi nợ"
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="CASH"
                  control={<Radio />}
                  label="💵 Thanh toán khi nhận hàng (COD)"
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="E_WALLET"
                  control={<Radio />}
                  label="📱 Ví điện tử"
                  disabled={isLoading}
                />
              </RadioGroup>
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
                disabled={isLoading}
              />
            </CardContent>
          </Card>
        </Box>

        {/* RIGHT SUMMARY */}
        <Box sx={{ width: { xs: "100%", md: 280 }, flexShrink: 0 }}>
          <Card
            sx={{
              borderRadius: 2,
              position: { md: "sticky" },
              top: { md: 20 },
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                📦 Tóm tắt đơn hàng
              </Typography>

              {/* Cart Items Preview */}
              <Box sx={{ mb: 2, maxHeight: 300, overflowY: "auto" }}>
                {directProduct ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1.5,
                      pb: 1.5,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {directProduct.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        x{directProduct.quantity}
                      </Typography>
                    </Box>
<<<<<<< HEAD
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ ml: 1, whiteSpace: "nowrap" }}
                    >
                      {formatCurrency(item.currentPrice * item.quantity)}
=======
                    <Typography variant="body2" fontWeight={500} sx={{ ml: 1, whiteSpace: "nowrap" }}>
                      {formatCurrency(directProduct.currentPrice * directProduct.quantity)}
>>>>>>> origin/dev
                    </Typography>
                  </Box>
                ) : (
                  (cart?.items || []).map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                        pb: 1.5,
                        borderBottom: "1px solid #eee",
                        "&:last-child": { borderBottom: "none" },
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
                      <Typography variant="body2" fontWeight={500} sx={{ ml: 1, whiteSpace: "nowrap" }}>
                        {formatCurrency(item.currentPrice * item.quantity)}
                      </Typography>
                    </Box>
                  ))
                )}
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
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="textSecondary"
                  >
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
                  bgcolor: "#e3f2fd",
                  borderRadius: 1,
                  border: "2px solid #1976d2",
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
                  onClick={() => navigate("/cart")}
                  disabled={isLoading}
                  sx={{ textTransform: "none" }}
                >
                  ← Quay lại giỏ hàng
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmitOrder}
                  disabled={isLoading || (cart?.items?.length || 0) === 0}
                  sx={{
                    bgcolor: "#00CFFF",
                    textTransform: "none",
                    borderRadius: 1,
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#00B8D4" },
                  }}
                >
                  {isLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} sx={{ color: "#fff" }} />
                      <span>Đang xử lý...</span>
                    </Stack>
                  ) : (
                    `✅ Xác nhận đặt hàng (${
                      cart?.items?.length || 0
                    } sản phẩm)`
                  )}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}
