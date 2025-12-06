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
  MenuItem,
  Button,
  CircularProgress,
  IconButton,
  Menu,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useInvoices } from "../../hooks/useInvoices";
import { useNavigate } from "react-router-dom";
import { InvoiceApi } from "../../api/invoice/InvoiceApi";
import { ActivityLogApi } from "../../api/activity/ActivityLogApi";
import { downloadExcelFile } from "../../utils/exportToExcel";

const InvoiceListScreen = () => {
  const { invoices, loading, error, filters } = useInvoices({
    page: 0,
    size: 20,
  });
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<
    number | null
  >(null);
  const [exporting, setExporting] = React.useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    invoiceId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoiceId(invoiceId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoiceId(null);
  };

  const handleDeleteInvoice = (invoiceId: number) => {
    console.log("Xoá hóa đơn:", invoiceId);
    handleMenuClose();
  };

  const handleViewDetail = (invoiceId: number) => {
    navigate(`/admin/invoices/${invoiceId}`);
    handleMenuClose();
  };

  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      const response = await InvoiceApi.exportToExcel(filters);

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = "Hoa_don.xlsx";
      if (contentDisposition) {
        try {
          filename =
            contentDisposition.split("filename=")[1].split('"')[1] || filename;
        } catch (e: any) {
          // Use default filename if parsing fails
          console.error(e);
        }
      }

      downloadExcelFile(response.data, filename);

      // Log export action
      await ActivityLogApi.createActivityLog({
        userType: "ADMIN",
        userId: 0,
        userName: "Admin",
        actionType: "EXPORT_REPORT",
        description: "Xuất báo cáo hóa đơn",
        entityType: "INVOICE",
        status: "SUCCESS",
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
        userType: "ADMIN",
        userId: 0,
        userName: "Admin",
        actionType: "EXPORT_REPORT",
        description: "Lỗi xuất báo cáo hóa đơn",
        entityType: "INVOICE",
        status: "FAILED",
        details: (error as Error).message,
      }).catch((e) => console.error("Failed to log error:", e));

      alert("Lỗi khi xuất file Excel");
    } finally {
      setExporting(false);
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
          Danh sách Hóa đơn
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportToExcel}
          disabled={exporting || loading}
        >
          {exporting ? "Đang xuất..." : "Xuất Excel"}
        </Button>
      </Box>
      {/* <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
        <TextField
          name="search"
          size="small"
          placeholder="Tìm kiếm theo mã HĐ, mã đơn, tên KH..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
          sx={{ minWidth: 280 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái thanh toán</InputLabel>
          <Select name="status" value={filters.status || ''} label="Trạng thái thanh toán" onChange={handleSelectChange}>
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="PAID">Đã thanh toán</MenuItem>
            <MenuItem value="UNPAID">Chưa thanh toán</MenuItem>
            <MenuItem value="OVERDUE">Quá hạn</MenuItem>
          </Select>
        </FormControl>
        <TextField
          name="date"
          size="small"
          type="date"
          label="Ngày tạo"
          InputLabelProps={{ shrink: true }}
          value={filters.date || ''}
          onChange={handleTextFieldChange}
        />
        <Button variant="outlined">Xuất file</Button>
      </Box> */}

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
              <TableCell width={120} sx={{ whiteSpace: "nowrap" }}>
                Mã hóa đơn
              </TableCell>
              <TableCell width={150}>Khách hàng</TableCell>
              <TableCell width={120} sx={{ whiteSpace: "nowrap" }}>
                Ngày tạo
              </TableCell>
              <TableCell
                width={130}
                align="right"
                sx={{ whiteSpace: "nowrap" }}
              >
                Tổng tiền
              </TableCell>
              <TableCell width={120} sx={{ whiteSpace: "nowrap" }}>
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, inv.id)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={selectedInvoiceId === inv.id ? anchorEl : null}
                    open={selectedInvoiceId === inv.id && Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleViewDetail(inv.id)}>
                      <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Xem chi
                      tiết
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleDeleteInvoice(inv.id)}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Xoá
                    </MenuItem>
                  </Menu>
                </TableCell>
                <TableCell>{inv.invoiceCode}</TableCell>
                <TableCell>{inv.customerName}</TableCell>
                <TableCell>
                  {new Date(inv.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell align="right">
                  {inv.total.toLocaleString()}₫
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={
                      inv.status === "PAID"
                        ? "Đã thanh toán"
                        : inv.status === "UNPAID"
                        ? "Chưa thanh toán"
                        : inv.status === "CREATED"
                        ? "Đã tạo"
                        : inv.status === "CANCELLED"
                        ? "Đã huỷ"
                        : "Quá hạn"
                    }
                    color={
                      inv.status === "PAID"
                        ? "success"
                        : inv.status === "UNPAID"
                        ? "warning"
                        : inv.status === "CREATED"
                        ? "success"
                        : inv.status === "CANCELLED"
                        ? "error"
                        : "error"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default InvoiceListScreen;
