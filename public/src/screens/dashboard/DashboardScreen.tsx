import React, { useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  LinearProgress,
} from "@mui/material";
import { useDashboard } from "./Dashboard.hook";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";

const DashboardScreen = () => {
  const {
    kpis,
    recentOrders,
    newCustomers,
    monthlyRevenue,
    orderStatusDistribution,
    loading,
    error,
    reload,
  } = useDashboard();

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      trending_up: <TrendingUpIcon sx={{ fontSize: 32, color: "white" }} />,
      shopping_cart: <ShoppingCartIcon sx={{ fontSize: 32, color: "white" }} />,
      people: <PeopleIcon sx={{ fontSize: 32, color: "white" }} />,
      pending_actions: (
        <PendingActionsIcon sx={{ fontSize: 32, color: "white" }} />
      ),
    };
    return iconMap[iconName] || <Box sx={{ fontSize: 32 }}>📊</Box>;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "DELIVERED":
        return "success";
      case "PROCESSING":
      case "SHIPPING":
        return "info";
      case "CANCELLED":
        return "error";
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      COMPLETED: "✅ Hoàn thành",
      PROCESSING: "⏳ Đang xử lý",
      CANCELLED: "❌ Đã huỷ",
      PENDING: "⏸️ Chờ xử lý",
      APPROVED: "✔️ Đã xác nhận",
      DELIVERED: "🚚 Đã giao",
      SHIPPING: "📦 Đang giao",
    };
    return statusMap[status?.toUpperCase()] || status;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "-";
    }
  };

  const navigate = useNavigate();
  //get user information
  const user = useSelector((state: RootState) => state.userAuth.user);

  useEffect(() => {
    if (!user) {
      navigate("/admin/login");
    }
  }, [user]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        mb={3}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h4" fontWeight={700} mb={1}>
            📊 Bảng điều khiển
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Thống kê tổng quan hoạt động kinh doanh
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={reload}
          disabled={loading}
        >
          Tải lại
        </Button>
      </Box>

      {/* Loading & Error States */}
      {loading && (
        <Box display="flex" justifyContent="center" my={6}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Stack spacing={3}>
          {/* KPI Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {kpis.map((kpi, index) => (
              <Card
                key={index}
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                        {kpi.title}
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {kpi.title.includes("doanh thu")
                          ? formatCurrency(kpi.value)
                          : kpi.value.toLocaleString("vi-VN")}
                      </Typography>
                      {kpi.percentageChange && (
                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              kpi.percentageChange >= 0 ? "#4CAF50" : "#F44336",
                            mt: 1,
                          }}
                        >
                          {kpi.percentageChange >= 0 ? "📈" : "📉"}{" "}
                          {Math.abs(kpi.percentageChange)}%
                        </Typography>
                      )}
                    </Box>
                    <Box>{getIconComponent(kpi.icon)}</Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Charts Row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
              gap: 2,
            }}
          >
            {/* Monthly Revenue Chart */}
            {monthlyRevenue.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    📈 Doanh thu theo tháng
                  </Typography>
                  <Stack spacing={1}>
                    {monthlyRevenue.slice(-6).map((item, index) => {
                      const maxRevenue = Math.max(
                        ...monthlyRevenue.map((m) => m.revenue || 0)
                      );
                      const percentage =
                        maxRevenue > 0
                          ? ((item.revenue || 0) / maxRevenue) * 100
                          : 0;

                      return (
                        <Box key={index}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            mb={0.5}
                          >
                            <Typography variant="caption">
                              {item.month}
                            </Typography>
                            <Typography variant="caption" fontWeight={600}>
                              {formatCurrency(item.revenue || 0)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Order Status Distribution */}
            {Object.keys(orderStatusDistribution).length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    📊 Trạng thái đơn hàng
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(orderStatusDistribution).map(
                      ([status, count], index) => {
                        const totalOrders = Object.values(
                          orderStatusDistribution
                        ).reduce((a, b) => a + b, 0);
                        const percentage =
                          totalOrders > 0
                            ? ((count || 0) / totalOrders) * 100
                            : 0;
                        const colors = [
                          "#4CAF50",
                          "#2196F3",
                          "#F44336",
                          "#FF9800",
                        ];

                        return (
                          <Box key={index}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              mb={0.5}
                            >
                              <Typography variant="caption">
                                {getStatusLabel(status)}
                              </Typography>
                              <Typography variant="caption" fontWeight={600}>
                                {count} ({percentage.toFixed(1)}%)
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{
                                height: 6,
                                borderRadius: 1,
                                backgroundColor: "#e0e0e0",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor:
                                    colors[index % colors.length],
                                },
                              }}
                            />
                          </Box>
                        );
                      }
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Recent Orders Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                🛒 Đơn hàng gần đây
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>
                        <strong>Mã đơn</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Khách hàng</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Tổng tiền</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Trạng thái</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Ngày tạo</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>{order.orderCode}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(order.status)}
                              size="small"
                              color={getStatusColor(order.status) as any}
                            />
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{ py: 3, color: "textSecondary" }}
                        >
                          Không có đơn hàng
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>

          {/* New Customers Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                👥 Khách hàng mới
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>
                        <strong>Tên</strong>
                      </TableCell>
                      <TableCell>
                        <strong>SĐT/Email</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Ngày tham gia</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newCustomers.length > 0 ? (
                      newCustomers.map((customer) => (
                        <TableRow key={customer.id} hover>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>
                            {customer.phone ? customer.phone : customer.email}
                          </TableCell>
                          <TableCell>
                            {formatDate(customer.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          align="center"
                          sx={{ py: 3, color: "textSecondary" }}
                        >
                          Không có khách hàng mới
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
};

export default DashboardScreen;
