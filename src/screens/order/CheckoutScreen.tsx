import { useEffect } from "react";
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
  Paper,
  Chip,
} from "@mui/material";
import { formatCurrency } from "../../utils/formatCurrency";
import HistoryIcon from "@mui/icons-material/History";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import useCheckout from "./Checkout.hook";
import { useNavigate } from "react-router-dom";
import AddDeliveryForm from "../customerLayout/listAddress/AddDeliveryForm";
import VoucherDialog from "../../components/voucher/VoucherDialog";
import ErrorPopup from "../../components/ErrorPopup";

export default function CheckoutScreen() {
  const navigate = useNavigate();

  const {
    qrCode,
    //state address
    listAddress,
    // streetAddress,
    showListAddresses,
    setShowListAddresses,
    // setStreetAddress,
    //handle
    handleInputChange,
    handleSubmitOrder,
    handleSelecteAddress,
    //form data
    formData,
    setFormData,
    //error
    errorApi,
    successMessage,
    setSuccessMessage,
    isLoading,
    error,
    setError,
    setErrorApi,
    //direct product & cart
    directProduct,
    cart,
    //subtotal discount
    discount,
    subtotal,
    finalTotal,
    addAddress,
    setOpenForm,
    openForm,
    //voucher
    vouchers,
    selectedVoucher,
    setSelectedVoucher,
    voucherModalOpen,
    setVoucherModalOpen,
  } = useCheckout();

  // Initialize form with customer data
  useEffect(() => {
    if (listAddress && listAddress.length > 0) {
      const defaultAddr = listAddress.find((addr) => addr.isDefault);

      if (defaultAddr) {
        setFormData((prev) => ({
          ...prev,
          receiverName: defaultAddr.recipientName || "",
          receiverPhoneNumber: defaultAddr.phone || "",
        }));

        // setStreetAddress(defaultAddr.fullAddress || "");
      }
    }
  }, [listAddress]);

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: e.target.value as "CASH" | "MOMO",
    }));
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 4 }}>
      {errorApi && (
        <ErrorPopup
          errorMessage={errorApi}
          open={!!errorApi}
          onClose={() => setErrorApi(null)}
        />
      )}
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  🏠 Thông tin giao hàng
                </Typography>
                {listAddress.length > 0 && (
                  <Button
                    size="small"
                    startIcon={
                      showListAddresses ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )
                    }
                    onClick={() => setShowListAddresses(!showListAddresses)}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.85rem",
                      color: "#1976d2",
                    }}
                  >
                    <HistoryIcon sx={{ mr: 0.5, fontSize: "1rem" }} />
                    {showListAddresses ? "Ẩn" : "Chọn"} địa chỉ khác (
                    {listAddress.length})
                  </Button>
                )}
              </Box>

              {/* List Customer Delivery Addresses Section */}
              {showListAddresses && listAddress.length > 0 && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1,
                    border: "1px solid #ddd",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>
                    📋 Chọn một trong những địa chỉ giao hàng của bạn:
                  </Typography>
                  <Stack spacing={1.5}>
                    {listAddress.map((addr) => (
                      <Paper
                        key={addr.id}
                        sx={{
                          p: 1.5,
                          cursor: "pointer",
                          border: "1px solid #ddd",
                          borderRadius: 1,
                          transition: "all 0.3s",
                          "&:hover": {
                            bgcolor: "#e3f2fd",
                            borderColor: "#1976d2",
                            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.1)",
                          },
                        }}
                        onClick={() => handleSelecteAddress(addr)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {addr.recipientName || "Không rõ"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              📞 {addr.phone}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, color: "#555" }}
                            >
                              {addr.fullAddress}
                            </Typography>
                          </Box>
                          <Chip
                            label="Chọn"
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{ ml: 1, flexShrink: 0 }}
                          />
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Họ và tên người nhận"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                  disabled={true}
                />

                {/*full address*/}
                <TextField
                  fullWidth
                  size="small"
                  label="Địa chỉ"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="VD: 123, Xã Sơn Bình, Huyện Tam Đường, Tỉnh Lai Châu"
                  disabled={true}
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
                  disabled={true}
                />
                <Button
                  variant="outlined"
                  onClick={() => setOpenForm(true)}
                  sx={{ textTransform: "none" }}
                >
                  Thêm địa chỉ giao hàng
                </Button>
                <AddDeliveryForm
                  open={openForm}
                  onClose={() => setOpenForm(false)}
                  onSubmit={addAddress}
                />
              </Stack>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* vouchers */}
          <Box
            sx={{
              my: 2,
              p: 2,
              borderRadius: 2,
              border: "1px dashed #ffbb8b",
              bgcolor: "#fff8f0",
              cursor: "pointer",
            }}
            onClick={() => setVoucherModalOpen(true)}
          >
            <Button sx={{ fontWeight: 600, color: "#ff5f00" }}>
              Chọn voucher
            </Button>

            {selectedVoucher ? (
              <Typography sx={{ mt: 1, fontSize: 14 }}>
                Đang áp dụng:{" "}
                <span style={{ color: "#ff5f00", fontWeight: 600 }}>
                  {selectedVoucher.code}
                </span>
              </Typography>
            ) : (
              <Typography sx={{ mt: 1, fontSize: 13, color: "#666" }}>
                Chưa chọn voucher
              </Typography>
            )}
          </Box>

          <VoucherDialog
            onSelectVoucher={(v) => setSelectedVoucher(v)}
            onClose={() => setVoucherModalOpen(false)}
            vouchers={vouchers}
            open={voucherModalOpen}
            selectedVoucher={selectedVoucher}
          />

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
                {qrCode && (
                  <img
                    src={qrCode}
                    alt="QR Code Momo"
                    style={{
                      width: 250,
                      height: 250,
                      marginTop: 16,
                      borderRadius: 8,
                      border: "2px solid #ccc",
                    }}
                  />
                )}{" "}
                <FormControlLabel
                  value="MOMO"
                  control={<Radio />}
                  label="📱 Ví điện tử MOMO"
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
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ ml: 1, whiteSpace: "nowrap" }}
                    >
                      {formatCurrency(
                        directProduct.currentPrice * directProduct.quantity
                      )}
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
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{ ml: 1, whiteSpace: "nowrap" }}
                      >
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

                {discount > 0 && (
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ color: "#d32f2f" }}
                  >
                    <Typography variant="body2" color="inherit">
                      Giảm giá
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="inherit"
                    >
                      -{formatCurrency(discount)}
                    </Typography>
                  </Box>
                )}

                {selectedVoucher && (
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ color: "#d32f2f" }}
                  >
                    <Typography variant="body2" color="inherit">
                      Voucher #{selectedVoucher.code}
                    </Typography>{" "}
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="inherit"
                    >
                      -{formatCurrency(selectedVoucher.value)}
                    </Typography>
                  </Box>
                )}

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
                  bgcolor: discount > 0 ? "#fff3e0" : "#e3f2fd",
                  borderRadius: 1,
                  border:
                    discount > 0 ? "2px solid #f57c00" : "2px solid #1976d2",
                  mb: 2,
                }}
              >
                <Typography
                  fontWeight="bold"
                  color={discount > 0 ? "#e65100" : "#1565c0"}
                >
                  Tổng cộng
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={discount > 0 ? "#e65100" : "#1565c0"}
                >
                  {formatCurrency(finalTotal)}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={isLoading}
                  sx={{ textTransform: "none" }}
                >
                  ← Quay lại
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmitOrder}
                  disabled={
                    isLoading ||
                    ((cart?.items?.length || 0) === 0 && !directProduct)
                  }
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
                      directProduct ? "1" : cart?.items?.length || 0
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
