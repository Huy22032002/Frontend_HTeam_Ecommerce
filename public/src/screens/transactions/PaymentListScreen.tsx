import React from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  TextField,
  MenuItem,
  Select,
  Button,
  CircularProgress,
  Pagination,
  Alert,
  TableContainer,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePayments } from "../../hooks/usePayments";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDateWithoutTimezoneShift } from "../../utils/formatDateUtils";

const PaymentListScreen = () => {
  const theme = useTheme();
  const { payments, total, loading, error, filters, setFilters } = usePayments({
    page: 0,
    size: 10,
  });

  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  // const [selectedPaymentId, setSelectedPaymentId] = React.useState<
  //   number | null
  // >(null);

  const [showFilters, setShowFilters] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const pageSize = filters.size || 10;
  const totalPages = Math.ceil(total / pageSize);

  // const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, paymentId: number) => {
  //   setAnchorEl(event.currentTarget);
  //   setSelectedPaymentId(paymentId);
  // };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  //   setSelectedPaymentId(null);
  // };

  // const handleDeletePayment = (paymentId: number) => {
  //   console.log('Xoá thanh toán:', paymentId);
  //   handleMenuClose();
  // };

  // const handleViewDetail = (paymentId: number) => {
  //   console.log('Xem chi tiết thanh toán:', paymentId);
  //   handleMenuClose();
  // };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 0 }));
    setPage(0);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "all" ? undefined : value,
      page: 0,
    }));
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 0 }));
    setPage(0);
  };

  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage - 1);
    setFilters((prev) => ({ ...prev, page: newPage - 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 0, size: 10 });
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          💳 Lịch Sử Thanh Toán
        </Typography>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          {showFilters ? "Ẩn" : "Hiện"} Bộ lọc
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Lỗi: {String(error)}
        </Alert>
      )}

      {/* Main Layout: Filter Sidebar + Content */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: showFilters ? "250px 1fr" : "1fr",
          gap: 3,
        }}
      >
        {/* Filter Sidebar */}
        {showFilters && (
          <Box
            sx={{
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
              height: "fit-content",
              position: "sticky",
              top: 20,
            }}
          >
            <Typography sx={{ fontWeight: "bold", mb: 2, fontSize: "16px" }}>
              🔍 Bộ Lọc
            </Typography>

            {/* Search */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "14px" }}>
                Tìm kiếm
              </Typography>
              <TextField
                size="small"
                placeholder="Mã TT, mã HĐ, tên KH..."
                fullWidth
                value={filters.search || ""}
                onChange={handleSearchChange}
              />
            </Box>

            {/* Status Filter */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "14px" }}>
                Trạng Thái
              </Typography>
              <Select
                fullWidth
                size="small"
                name="status"
                value={filters.status || "all"}
                onChange={handleSelectChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="SUCCESS">Hoàn thành</MenuItem>
                <MenuItem value="PENDING">Đang chờ</MenuItem>
                <MenuItem value="FAILED">Thất bại</MenuItem>
              </Select>
            </Box>

            {/* Payment Method Filter */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "14px" }}>
                Phương Thức
              </Typography>
              <Select
                fullWidth
                size="small"
                name="paymentMethod"
                value={filters.paymentMethod || "all"}
                onChange={handleSelectChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="BANK_TRANSFER">Chuyển khoản</MenuItem>
                <MenuItem value="CREDIT_CARD">Thẻ tín dụng</MenuItem>
                <MenuItem value="COD">Thanh toán khi nhận</MenuItem>
                <MenuItem value="E_WALLET">Ví điện tử</MenuItem>
              </Select>
            </Box>

            {/* Date Filter */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "14px" }}>
                Ngày Tạo
              </Typography>
              <TextField
                name="date"
                size="small"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.date || ""}
                onChange={handleTextFieldChange}
              />
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
            >
              <Button
                variant="contained"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Áp dụng
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                sx={{ textTransform: "none" }}
              >
                Xóa
              </Button>
            </Box>
          </Box>
        )}

        {/* Main Content */}
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Table */}
              <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
                <Table>
                  <TableHead
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
                    }}
                  >
                    <TableRow>
                      {/* <TableCell sx={{ fontWeight: "bold", width: "80px" }}>
                        Thao Tác
                      </TableCell> */}
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Mã Thanh Toán
                      </TableCell>
                      {/* <TableCell sx={{ fontWeight: "bold" }}>Mã Hóa Đơn</TableCell> */}
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Mã Đơn Hàng
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Khách Hàng
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Ngày Tạo
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Phương Thức
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", textAlign: "right" }}
                      >
                        Số Tiền
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", textAlign: "center" }}
                      >
                        Trạng Thái
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.length > 0 ? (
                      payments.map((p) => (
                        <TableRow key={p.id} hover>
                          {/* <TableCell>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, p.id)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                            <Menu
                              anchorEl={selectedPaymentId === p.id ? anchorEl : null}
                              open={
                                selectedPaymentId === p.id && Boolean(anchorEl)
                              }
                              onClose={handleMenuClose}
                            >
                              <MenuItem onClick={() => handleViewDetail(p.id)}>
                                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />{" "}
                                Xem chi tiết
                              </MenuItem>
                              <MenuItem
                                onClick={() => handleDeletePayment(p.id)}
                                sx={{ color: "error.main" }}
                              >
                                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />{" "}
                                Xoá
                              </MenuItem>
                            </Menu>
                          </TableCell> */}
                          <TableCell sx={{ fontWeight: 600 }}>
                            {p.paymentCode}
                          </TableCell>
                          {/* <TableCell>{p.invoiceCode}</TableCell> */}
                          <TableCell>{p.orderCode}</TableCell>
                          <TableCell>{p.customerName}</TableCell>
                          <TableCell>
                            {formatDateWithoutTimezoneShift(p.createdAt)}
                          </TableCell>
                          <TableCell>{p.paymentMethod}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(p.amount)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={
                                p.status === "SUCCESS"
                                  ? "Hoàn thành"
                                  : p.status === "PENDING"
                                  ? "Đang chờ"
                                  : "Thất bại"
                              }
                              color={
                                p.status === "SUCCESS"
                                  ? "success"
                                  : p.status === "PENDING"
                                  ? "warning"
                                  : "error"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          Không tìm thấy thanh toán nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentListScreen;
