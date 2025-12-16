import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import type { RootState } from "../../../store/store";
import { useOrderHistory } from "../../../hooks/useOrderHistory";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateWithoutTimezoneShift } from "../../../utils/formatDateUtils";
import { OrderApi } from "../../../api/order/OrderApi";
import type { OrderReadableDTO } from "../../../models/orders/Order";
import useOrderHistoryy from "./OrderHistory.hook";

const OrderHistoryScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { orders, isLoading, error } = useOrderHistory();

  const {
    selectedOrder,
    setSelectedOrder,
    openDialog,
    setOpenDialog,
    cancelLoading,
    setCancelLoading,
    cancelRestrictionMessage,
    setCancelRestrictionMessage,
    openCancelRestrictionDialog,
    setOpenCancelRestrictionDialog,
    snackbar,
    setSnackbar,
    //color / label render
    getStatusColor,
    getStatusLabel,
  } = useOrderHistoryy();

  const customer = useSelector(
    (state: RootState) => state.customerAuth?.customer
  );

  // Nếu chưa đăng nhập, redirect đến login
  if (!customer?.id) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="warning">
          Vui lòng đăng nhập để xem lịch sử đơn hàng
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{ mt: 2 }}
        >
          Đến trang đăng nhập
        </Button>
      </Box>
    );
  }

  const handleViewDetails = (order: OrderReadableDTO) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    // Kiểm tra trạng thái - chỉ cho phép huỷ khi PENDING
    if (!["PENDING"].includes(selectedOrder.status)) {
      setCancelRestrictionMessage(
        'Chỉ có thể hủy đơn hàng ở trạng thái "Đang chờ". Đơn hàng hiện tại không thể hủy.'
      );
      setOpenCancelRestrictionDialog(true);
      return;
    }

    setCancelLoading(true);
    try {
      const response = await OrderApi.cancelByCustomer(selectedOrder.id);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: "✅ Hủy đơn hàng thành công!",
          severity: "success",
        });
        setOpenDialog(false);
        // Refresh lịch sử đơn hàng
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      const errorMessage =
        error?.response?.data?.message || "Hủy đơn hàng thất bại";
      setSnackbar({
        open: true,
        message: `❌ ${errorMessage}`,
        severity: "error",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const canCancelOrder =
    selectedOrder && ["PENDING"].includes(selectedOrder.status);

  const handleReceiveOrder = async () => {
    if (!selectedOrder) return;

    // Check trạng thái - chỉ cho phép xác nhận khi SHIPPING
    if (selectedOrder.status !== "SHIPPING") {
      setCancelRestrictionMessage(
        'Chỉ có thể xác nhận nhận hàng khi đơn hàng đang "Đang giao". Đơn hàng hiện tại không thể xác nhận.'
      );
      setOpenCancelRestrictionDialog(true);
      return;
    }

    try {
      setCancelLoading(true);
      // Use customer endpoint to update status to DELIVERED
      const customerToken = localStorage.getItem("customer_token");
      if (!customerToken) {
        throw new Error("Vui lòng đăng nhập để thực hiện hành động này");
      }

      const apiUrl =
        (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") +
        "/api";
      const response = await fetch(
        `${apiUrl}/customers/orders/${selectedOrder.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${customerToken}`,
          },
          body: JSON.stringify({ status: "DELIVERED" }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Lỗi khi xác nhận nhận hàng";
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
          }
        } else {
          errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setSnackbar({
        open: true,
        message: "✅ Xác nhận nhận hàng thành công!",
        severity: "success",
      });

      // Close dialog and refresh
      setOpenDialog(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi khi xác nhận nhận hàng:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Lỗi khi xác nhận nhận hàng";
      setSnackbar({
        open: true,
        message: `❌ ${errorMessage}`,
        severity: "error",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        maxWidth: 1000,
        background: "white",
        p: { xs: 1, sm: 2, md: 3 },
        borderRadius: 2,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        mx: "auto", // căn giữa
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          maxWidth: "1400px",
          mx: "auto",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            📦 Lịch sử đơn hàng
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Empty State */}
            {orders.length === 0 ? (
              <Card sx={{ textAlign: "center", py: 8, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    📭 Bạn chưa có đơn hàng nào
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 3 }}>
                    Hãy bắt đầu mua sắm ngay để tạo đơn hàng đầu tiên của bạn
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/")}
                    sx={{
                      bgcolor: "#00CFFF",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#00B8D4" },
                    }}
                  >
                    ➜ Tiếp tục mua sắm
                  </Button>
                </CardContent>
              </Card>
            ) : isMobile ? (
              /* render trên mobile thì dùng CARD thay vì Table */
              <Stack spacing={2}>
                {orders.map((order) => (
                  <Card key={order.id} sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography
                        fontWeight={600}
                        sx={{
                          color: "#1976d2",
                          cursor: "pointer",
                          mb: 0.5,
                        }}
                        onClick={() => handleViewDetails(order)}
                      >
                        {order.orderCode}
                      </Typography>

                      <Typography variant="body2" color="textSecondary">
                        {formatDateWithoutTimezoneShift(order.createdAt)}
                      </Typography>

                      <Typography fontWeight={600} sx={{ mt: 1 }}>
                        {formatCurrency(order.total)}
                      </Typography>

                      <Chip
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ mt: 1 }}
                      />

                      <Button
                        fullWidth
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(order)}
                        sx={{ mt: 2, textTransform: "none" }}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              /* Orders Table */
              <TableContainer
                component={Paper}
                sx={{ borderRadius: 2, width: "100%", overflowX: "auto" }}
              >
                <Table sx={{ minWidth: 700 }}>
                  <TableHead
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
                    }}
                  >
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Mã đơn hàng
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Ngày tạo
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="right">
                        Tổng tiền
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="center">
                        Trạng thái
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="center">
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        sx={{
                          "&:hover": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "#2a2a2a"
                                : "#f9f9f9",
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color:
                              theme.palette.mode === "dark"
                                ? "#00CFFF"
                                : "#1976d2",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          onClick={() => handleViewDetails(order)}
                        >
                          {order.orderCode}
                        </TableCell>
                        <TableCell>
                          {formatDateWithoutTimezoneShift(order.createdAt)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status)}
                            variant="filled"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(order)}
                            sx={{
                              textTransform: "none",
                              color:
                                theme.palette.mode === "dark"
                                  ? "#00CFFF"
                                  : "#1976d2",
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {/* Order Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          {selectedOrder && (
            <>
              <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
                Chi tiết đơn hàng {selectedOrder.orderCode}
              </DialogTitle>
              <DialogContent sx={{ py: 2 }}>
                <Stack spacing={2}>
                  {/* Order Info */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      gutterBottom
                    >
                      Thông tin đơn hàng
                    </Typography>
                    <Stack spacing={1} sx={{ pl: 2 }}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Mã đơn:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedOrder.orderCode}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Khách hàng:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedOrder.customerName}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Ngày tạo:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatDateWithoutTimezoneShift(
                            selectedOrder.createdAt
                          )}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Trạng thái:
                        </Typography>
                        <Chip
                          label={getStatusLabel(selectedOrder.status)}
                          color={getStatusColor(selectedOrder.status)}
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </Box>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Thông tin giao hàng
                      </Typography>
                      <Typography variant="body2" sx={{ pl: 2 }}>
                        {selectedOrder.shippingAddress}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ pl: 2 }}
                      >
                        {selectedOrder.receiverName} -{" "}
                        {selectedOrder.receiverPhoneNumber}
                      </Typography>
                    </Box>
                  )}

                  {/* Items */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      gutterBottom
                    >
                      Sản phẩm ({selectedOrder.items?.length || 0})
                    </Typography>
                    <Stack
                      spacing={1}
                      sx={{ pl: 2, maxHeight: 200, overflowY: "auto" }}
                    >
                      {selectedOrder.items?.map((item, index) => (
                        <Box
                          onClick={() => {
                            navigate(`/product/${item.variantId}`);
                          }}
                          key={index}
                          display="flex"
                          justifyContent="space-between"
                          sx={{
                            pb: 1,
                            borderBottom:
                              index !== (selectedOrder.items?.length || 0) - 1
                                ? "1px solid #eee"
                                : "none",
                          }}
                        >
                          <Box flex={1}>
                            <Typography
                              sx={{
                                "&:hover": {
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                },
                              }}
                              variant="body2"
                              fontWeight={600}
                            >
                              {item.productName || item.sku}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              SKU: {item.sku}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              display="block"
                            >
                              Số lượng: {item.quantity}
                            </Typography>
                            {item.promotionId && (
                              <Box sx={{ mt: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#d32f2f", fontWeight: 600 }}
                                >
                                  ✓ Khuyến mãi áp dụng
                                </Typography>
                                {item.discountAmount && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ color: "#d32f2f" }}
                                  >
                                    Giảm: {formatCurrency(item.discountAmount)}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(item.price * item.quantity)}
                            </Typography>
                            {item.discountAmount && (
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{
                                  color: "#d32f2f",
                                  fontWeight: 600,
                                  textAlign: "right",
                                }}
                              >
                                -{formatCurrency(item.discountAmount)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Ghi chú
                      </Typography>
                      <Typography variant="body2" sx={{ pl: 2 }}>
                        {selectedOrder.notes}
                      </Typography>
                    </Box>
                  )}

                  {/* Payment Status */}
                  {selectedOrder.deposits &&
                    selectedOrder.deposits.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          gutterBottom
                        >
                          💳 Thông tin thanh toán
                        </Typography>
                        <Stack spacing={1} sx={{ pl: 2 }}>
                          {selectedOrder.deposits.map(
                            (transaction: any, idx: number) => (
                              <Box
                                key={idx}
                                sx={{
                                  p: 1.5,
                                  bgcolor:
                                    theme.palette.mode === "dark"
                                      ? "#2a2a2a"
                                      : "#f9f9f9",
                                  borderRadius: 1,
                                  borderLeft: `3px solid ${
                                    transaction.status === "SUCCESS"
                                      ? "#4CAF50"
                                      : transaction.status === "PENDING"
                                      ? "#ff9800"
                                      : "#f44336"
                                  }`,
                                }}
                              >
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  mb={0.5}
                                >
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    {transaction.paymentType || "N/A"}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={
                                      transaction.status === "SUCCESS"
                                        ? "✓ Thành công"
                                        : transaction.status === "PENDING"
                                        ? "⏳ Chờ xử lý"
                                        : "✗ Thất bại"
                                    }
                                    color={
                                      transaction.status === "SUCCESS"
                                        ? "success"
                                        : transaction.status === "PENDING"
                                        ? "warning"
                                        : "error"
                                    }
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: "11px" }}
                                  />
                                </Box>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                >
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    {transaction.transactionDate
                                      ? new Date(
                                          transaction.transactionDate
                                        ).toLocaleDateString("vi-VN")
                                      : "N/A"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{ color: "#1976d2" }}
                                  >
                                    {formatCurrency(transaction.amount)}
                                  </Typography>
                                </Box>
                              </Box>
                            )
                          )}
                        </Stack>
                      </Box>
                    )}

                  {/* Total */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor:
                        theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
                      borderRadius: 1,
                    }}
                  >
                    <Stack spacing={1}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          Tạm tính:
                        </Typography>
                        <Typography variant="body2">
                          {formatCurrency(
                            (selectedOrder.total || 0) +
                              (selectedOrder.totalDiscount || 0)
                          )}
                        </Typography>
                      </Box>
                      {selectedOrder.totalDiscount &&
                        selectedOrder.totalDiscount > 0 && (
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ color: "#d32f2f" }}
                          >
                            <Typography variant="body2" color="inherit">
                              Giảm giá:
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="inherit"
                            >
                              -{formatCurrency(selectedOrder.totalDiscount)}
                            </Typography>
                          </Box>
                        )}
                      {/* Voucher (neu co) */}
                      {selectedOrder.voucherCode &&
                        selectedOrder.voucherDiscount && (
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ color: "#d32f2f" }}
                          >
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{
                                fontWeight: 500,
                                fontStyle: "italic",
                                display: "flex",
                                alignItems: "center",
                                color: "#d32f2f",
                              }}
                            >
                              Voucher:{" "}
                              <span
                                style={{
                                  marginLeft: 4,
                                  color: "#1976d2",
                                  fontWeight: 600,
                                }}
                              >
                                {selectedOrder.voucherCode || "Không có"}
                              </span>
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="inherit"
                            >
                              -{formatCurrency(selectedOrder.voucherDiscount)}
                            </Typography>
                          </Box>
                        )}
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          pt: 1,
                          borderTop: "2px solid #ddd",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Tổng cộng:
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color:
                              selectedOrder.totalDiscount &&
                              selectedOrder.totalDiscount > 0
                                ? "#d32f2f"
                                : "#1976d2",
                          }}
                        >
                          {formatCurrency(selectedOrder.total)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 2, gap: 1 }}>
                {selectedOrder.status === "SHIPPING" && (
                  <Button
                    onClick={handleReceiveOrder}
                    disabled={cancelLoading}
                    variant="contained"
                    color="success"
                    sx={{ textTransform: "none" }}
                  >
                    {cancelLoading ? "Đang xác nhận..." : "📦 Tôi đã nhận hàng"}
                  </Button>
                )}
                {canCancelOrder && (
                  <Button
                    onClick={handleCancelOrder}
                    disabled={cancelLoading}
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    sx={{ textTransform: "none" }}
                  >
                    {cancelLoading ? "Đang hủy..." : "Hủy đơn hàng"}
                  </Button>
                )}
                <Button
                  onClick={handleCloseDialog}
                  sx={{ textTransform: "none" }}
                >
                  Đóng
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Cancel Restriction Dialog */}
        <Dialog
          open={openCancelRestrictionDialog}
          onClose={() => setOpenCancelRestrictionDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: "bold", pb: 1, color: "#d32f2f" }}>
            Cannot Cancel Order
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
              {cancelRestrictionMessage}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#999", fontStyle: "italic" }}
            >
              Please contact customer support for assistance.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenCancelRestrictionDialog(false)}
              variant="contained"
              color="primary"
              sx={{ textTransform: "none" }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
      </Box>
    </Box>
  );
};

export default OrderHistoryScreen;
