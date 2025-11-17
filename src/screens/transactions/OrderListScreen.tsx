import * as React from "react";
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
  InputLabel,
  FormControl,
  CircularProgress,
  Paper,
  IconButton,
  Menu,
  Button,
  type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../../hooks/useOrders";

const OrderListScreen = () => {
  const navigate = useNavigate();
  const { orders, loading, error, filters, setFilters } = useOrders({
    page: 0,
    size: 20,
  });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(
    null
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    orderId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };

  const handleCreateOrder = () => {
    navigate("/admin/orders/create");
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn huỷ đơn hàng này không?")) {
      console.log("Huỷ đơn hàng:", orderId);
      // TODO: Gọi API xoá đơn hàng
    }
    handleMenuClose();
  };

  const handleViewDetail = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
    handleMenuClose();
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const getStatusLabel = (status: string | undefined | null) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "APPROVED":
        return "Đã xác nhận";
      case "PROCESSING":
        return "Đang xử lý";
      case "SHIPPING":
        return "Đang giao";
      case "DELIVERED":
        return "Đã giao";
      case "PAID":
        return "Thanh toán";
      case "CANCELLED":
        return "Đã huỷ";
      case "REFUNDED":
        return "Hoàn tiền";
      case "PARTIALLY_REFUNDED":
        return "Hoàn một phần";
      default:
        return status || "N/A";
    }
  };

  const getStatusColor = (
    status: string | undefined | null
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "info";
      case "PROCESSING":
        return "info";
      case "SHIPPING":
        return "warning";
      case "DELIVERED":
        return "success";
      case "PAID":
        return "success";
      case "CANCELLED":
        return "error";
      case "REFUNDED":
        return "error";
      case "PARTIALLY_REFUNDED":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" fontWeight={600}>
          Đơn hàng
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOrder}
        >
          Tạo đơn hàng
        </Button>
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField
            name="search"
            size="small"
            placeholder="Tìm kiếm theo mã, tên KH..."
            value={filters.search || ""}
            onChange={handleSearchChange}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
            sx={{ minWidth: 260 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={filters.status || ""}
              label="Trạng thái"
              onChange={handleSelectChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
              <MenuItem value="APPROVED">Đã xác nhận</MenuItem>
              <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
              <MenuItem value="SHIPPING">Đang giao</MenuItem>
              <MenuItem value="DELIVERED">Đã giao</MenuItem>
              <MenuItem value="PAID">Thanh toán</MenuItem>
              <MenuItem value="CANCELLED">Đã huỷ</MenuItem>
              <MenuItem value="REFUNDED">Hoàn tiền</MenuItem>
              <MenuItem value="PARTIALLY_REFUNDED">Hoàn một phần</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="date"
            size="small"
            type="date"
            label="Ngày tạo"
            InputLabelProps={{ shrink: true }}
            value={filters.date || ""}
            onChange={handleTextFieldChange}
          />
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Lỗi: {String(error)}</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={80} sx={{ whiteSpace: "nowrap" }}>
                Thao tác
              </TableCell>
              <TableCell width={100} sx={{ whiteSpace: "nowrap" }}>
                Mã
              </TableCell>
              <TableCell width={150}>Khách hàng</TableCell>
              <TableCell
                width={120}
                align="right"
                sx={{ whiteSpace: "nowrap" }}
              >
                Tổng
              </TableCell>
              <TableCell width={120} sx={{ whiteSpace: "nowrap" }}>
                Trạng thái
              </TableCell>
              <TableCell width={120} sx={{ whiteSpace: "nowrap" }}>
                Ngày
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} hover>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, o.id)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={selectedOrderId === o.id ? anchorEl : null}
                    open={selectedOrderId === o.id && Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleViewDetail(o.id)}>
                      <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Xem chi
                      tiết
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleCancelOrder(o.id)}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Huỷ đơn
                      hàng
                    </MenuItem>
                  </Menu>
                </TableCell>
                <TableCell>DH-{o.id}</TableCell>
                <TableCell>{o.customerName}</TableCell>
                <TableCell align="right">
                  {(o.total || 0).toLocaleString()}₫
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={getStatusColor(o.status)}
                    label={getStatusLabel(o.status)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(o.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default OrderListScreen;
