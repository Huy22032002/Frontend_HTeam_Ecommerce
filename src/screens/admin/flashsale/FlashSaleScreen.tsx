import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useFlashSale from "./FlashSale.hook";
import { useAdminPermissions } from "../../../hooks/useAdminPermissions";
import { useNavigate } from "react-router-dom";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import React, { useState } from "react";
import FlashSaleItemDetailRow from "../../../components/flashSale/FlashSaleItemRow";

const FlashSaleScreen = () => {
  const { flashSales, error, loading } = useFlashSale();
  const { isSuperAdmin } = useAdminPermissions();
  const navigate = useNavigate();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const [openRow, setOpenRow] = useState<number | null>(null);

  const statusMap = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: "Đang diễn ra", color: "success", variant: "filled" };
      case "UPCOMING":
        // Sử dụng info (xanh dương) cho trạng thái sắp diễn ra
        return { label: "Sắp diễn ra", color: "info", variant: "filled" };
      case "ENDED":
        // Sử dụng default (xám) và variant outlined cho trạng thái đã kết thúc
        return { label: "Đã kết thúc", color: "default", variant: "outlined" };
      default:
        return { label: status, color: "default", variant: "filled" };
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" fontWeight={600}>
          Quản lý Flash Sale
        </Typography>
        <Tooltip title={!isSuperAdmin ? "Chỉ SuperAdmin có thể tạo chiến dịch" : ""}>
          <span>
            <Button
              onClick={() => navigate("/admin/flash-sale/create")}
              variant="contained"
              size="small"
              disabled={!isSuperAdmin}
            >
              + Tạo chiến dịch
            </Button>
          </span>
        </Tooltip>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Lỗi: {String(error)}</Alert>
      ) : flashSales.length === 0 ? (
        <Alert severity="info">Không có Flash Sale nào</Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableRow>
              <TableCell>
                <strong>Mã</strong>
              </TableCell>
              <TableCell>
                <strong>Tên</strong>
              </TableCell>
              <TableCell>
                <strong>Mô tả</strong>
              </TableCell>
              <TableCell>
                <strong>Ngày/Giờ bắt đầu</strong>
              </TableCell>
              <TableCell>
                <strong>Ngày/Giờ kết thúc</strong>
              </TableCell>
              <TableCell>
                <strong>Trạng thái</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Hành động</strong>
              </TableCell>
            </TableRow>
            <TableBody>
              {flashSales.map((p) => (
                <React.Fragment key={p.id}>
                  {/* ROW CHÍNH */}
                  <TableRow
                    hover
                    sx={{
                      "& > *": { borderBottom: "unset" },
                    }}
                  >
                    <TableCell width={40}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setOpenRow(openRow === p.id ? null : p.id)
                        }
                      >
                        {openRow === p.id ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600, color: "#333" }}>
                      {p.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      {p.description}
                    </TableCell>
                    <TableCell>{formatDate(p.startTime)}</TableCell>
                    <TableCell>{formatDate(p.endTime)}</TableCell>

                    <TableCell>
                      {(() => {
                        const statusInfo = statusMap(p.status);
                        return (
                          <Chip
                            size="small"
                            color={statusInfo.color as any}
                            label={statusInfo.label}
                            variant={statusInfo.variant as any}
                            sx={{ fontWeight: 600 }}
                          />
                        );
                      })()}
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Chi tiết">
                        <IconButton size="small" color="info">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={!isSuperAdmin ? "Chỉ SuperAdmin có thể sửa" : "Sửa"}>
                        <span>
                          <IconButton size="small" color="primary" disabled={!isSuperAdmin}>
                            <EditIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* ROW PHỤ */}
                  <TableRow>
                    <TableCell colSpan={8} sx={{ p: 0, bgcolor: "#fafafa" }}>
                      <Collapse
                        in={openRow === p.id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ py: 2, px: 1 }}>
                          <FlashSaleItemDetailRow items={p.items} />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FlashSaleScreen;
