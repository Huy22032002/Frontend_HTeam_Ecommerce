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
  CircularProgress,
  Paper,
  IconButton,
  Menu,
  Button,
  TablePagination,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../../hooks/useOrders";
import { OrderApi } from "../../api/order/OrderApi";
import { ActivityLogApi } from "../../api/activity/ActivityLogApi";
import { downloadExcelFile } from "../../utils/exportToExcel";
import { formatDateWithoutTimezoneShift } from "../../utils/formatDateUtils";

const OrderListScreen = () => {
  const navigate = useNavigate();
  const { orders, total, loading, error, filters, setFilters } = useOrders({
    page: 0,
    size: 20,
  });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(
    null
  );
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [exporting, setExporting] = React.useState(false);
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<string>(
    filters.status || ""
  );

  // Status options for tabs
  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "APPROVED", label: "Đã xác nhận" },
    { value: "PROCESSING", label: "Đang xử lý" },
    { value: "SHIPPING", label: "Đang giao" },
    { value: "DELIVERED", label: "Đã giao" },
    { value: "PAID", label: "Thanh toán" },
    { value: "CANCELLED", label: "Đã huỷ" },
    { value: "REFUNDED", label: "Hoàn tiền" },
    { value: "PARTIALLY_REFUNDED", label: "Hoàn một phần" },
  ];

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

  const handleViewDetail = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
    handleMenuClose();
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPage(0); 
    setFilters((prev) => ({ ...prev, [name]: value, page: 0 }));
  };

  const handleStatusTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedStatusTab(newValue);
    setPage(0);
    setFilters((prev) => ({ ...prev, status: newValue, page: 0 }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0); 
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 0 }));
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
    setFilters((prev) => ({ ...prev, page: newPage, size: rowsPerPage }));
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setFilters((prev) => ({ ...prev, page: 0, size: newRowsPerPage }));
  };

  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      const response = await OrderApi.exportToExcel(filters);
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = "Don_hang.xlsx";
      if (contentDisposition) {
        try {
          filename = contentDisposition
            .split("filename=")[1]
            .split('"')[1] || filename;
        } catch (e) {
          // Use default filename if parsing fails
        }
      }
      
      downloadExcelFile(response.data, filename);

      // Log export action
      await ActivityLogApi.createActivityLog({
        userType: 'ADMIN',
        userId: 0,
        userName: 'Admin',
        actionType: 'EXPORT_REPORT',
        description: 'Xuất báo cáo đơn hàng',
        entityType: 'ORDER',
        status: 'SUCCESS',
        details: JSON.stringify({
          filters: filters,
          filename: filename,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Lỗi khi xuất file:", error);

      // Log error
      await ActivityLogApi.createActivityLog({
        userType: 'ADMIN',
        userId: 0,
        userName: 'Admin',
        actionType: 'EXPORT_REPORT',
        description: 'Lỗi xuất báo cáo đơn hàng',
        entityType: 'ORDER',
        status: 'FAILED',
        details: (error as Error).message,
      }).catch(e => console.error('Failed to log error:', e));

      alert("Lỗi khi xuất file Excel");
    } finally {
      setExporting(false);
    }
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
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportToExcel}
            disabled={exporting || loading}
          >
            {exporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOrder}
          >
            Tạo đơn hàng
          </Button>
        </Box>
      </Box>

      {/* Status Tabs */}
      <Paper sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tabs 
          value={selectedStatusTab} 
          onChange={handleStatusTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
              minWidth: "auto",
              px: 2,
            },
          }}
        >
          {statusOptions.map((option) => (
            <Tab
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Filters */}
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
          <TextField
            name="startDate"
            size="small"
            type="date"
            label="Từ ngày"
            InputLabelProps={{ shrink: true }}
            value={filters.startDate || ""}
            onChange={handleTextFieldChange}
          />
          <TextField
            name="endDate"
            size="small"
            type="date"
            label="Đến ngày"
            InputLabelProps={{ shrink: true }}
            value={filters.endDate || ""}
            onChange={handleTextFieldChange}
          />
          <TextField
            name="minAmount"
            size="small"
            type="number"
            placeholder="Tổng tiền tối thiểu"
            value={filters.minAmount || ""}
            onChange={handleTextFieldChange}
            sx={{ minWidth: 130 }}
          />
          <TextField
            name="maxAmount"
            size="small"
            type="number"
            placeholder="Tổng tiền tối đa"
            value={filters.maxAmount || ""}
            onChange={handleTextFieldChange}
            sx={{ minWidth: 130 }}
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
        <Paper>
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
                        <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Xem
                        chi tiết
                      </MenuItem>
                      {/* <MenuItem
                        onClick={() => handleCancelOrder(o.id)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Huỷ đơn
                        hàng
                      </MenuItem> */}
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
                    {formatDateWithoutTimezoneShift(o.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count}`
            }
          />
        </Paper>
      )}
    </Box>
  );
};

export default OrderListScreen;
