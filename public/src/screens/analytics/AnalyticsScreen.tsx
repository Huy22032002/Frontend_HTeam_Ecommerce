import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { ResponsiveLineCanvas } from "@nivo/line";
import { ResponsiveBarCanvas } from "@nivo/bar";
import { ResponsivePieCanvas } from "@nivo/pie";
import { AnalyticsApi, type AnalyticsFilterDTO } from "../../api/dashboard/AnalyticsApi";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsScreen = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFilter, setOpenFilter] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<{
    orders: AnalyticsFilterDTO;
    customers: AnalyticsFilterDTO;
    revenue: AnalyticsFilterDTO;
  }>({
    orders: { category: "orders" },
    customers: { category: "customers" },
    revenue: { category: "revenue" },
  });

  const [stats, setStats] = useState<any>({
    orders: null,
    customers: null,
    revenue: null,
  });

  const categories = [
    { key: "orders", label: "📦 Đơn hàng", icon: "📦" },
    { key: "customers", label: "👥 Khách hàng", icon: "👥" },
    { key: "revenue", label: "💰 Doanh thu", icon: "💰" },
  ];

  const loadAnalytics = useCallback(async (categoryKey: string) => {
    try {
      setLoading(true);
      setError(null);
      const filter = filters[categoryKey as keyof typeof filters];
      const response = await AnalyticsApi.getDetailedAnalytics(filter);
      
      // Transform backend data to Nivo format
      const data = response.data;
      if (data.timeSeries && Array.isArray(data.timeSeries)) {
        data.timeSeries = [{ id: categoryKey, data: data.timeSeries }];
      }
      if (data.breakdown && Array.isArray(data.breakdown)) {
        data.breakdown = data.breakdown; // Already in correct format for pie/bar
      }
      if (data.topItems && Array.isArray(data.topItems)) {
        data.topItems = data.topItems; // Already in correct format
      }
      
      setStats((prev: any) => ({
        ...prev,
        [categoryKey]: data,
      }));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Lỗi khi tải dữ liệu thống kê");
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load analytics on component mount
  useEffect(() => {
    const initialCategory = categories[0].key;
    loadAnalytics(initialCategory);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const categoryKey = categories[newValue].key;
    if (!stats[categoryKey as keyof typeof stats]) {
      loadAnalytics(categoryKey);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    const categoryKey = categories[tabValue].key;
    setFilters((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleApplyFilter = () => {
    const categoryKey = categories[tabValue].key;
    loadAnalytics(categoryKey);
    setOpenFilter(false);
  };

  const renderStatsOverview = () => {
    const categoryKey = categories[tabValue].key;
    const currentStats = stats[categoryKey as keyof typeof stats];

    if (!currentStats) {
      return <CircularProgress />;
    }

    const statCards = [
      {
        label: "Tổng số",
        value: currentStats.totalCount?.toLocaleString("vi-VN") || "0",
        color: "#3b82f6",
        bgColor: "#eff6ff",
      },
      {
        label: "Tổng tiền",
        value: currentStats.totalAmount
          ? (currentStats.totalAmount / 1000000).toFixed(1) + "M"
          : "0",
        color: "#10b981",
        bgColor: "#f0fdf4",
      },
      {
        label: "Trung bình",
        value: currentStats.averageAmount
          ? (currentStats.averageAmount / 1000000).toFixed(1) + "M"
          : "0",
        color: "#f59e0b",
        bgColor: "#fffbf0",
      },
      {
        label: "Bản ghi",
        value: `${currentStats.recordsFiltered}/${currentStats.recordsTotal}`,
        color: "#8b5cf6",
        bgColor: "#faf5ff",
      },
    ];

    return (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2, mb: 4 }}>
        {statCards.map((stat, idx) => (
          <Card
            key={idx}
            sx={{
              background: `linear-gradient(135deg, ${stat.bgColor} 0%, #ffffff 100%)`,
              border: `1px solid ${stat.color}20`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: `0 8px 16px ${stat.color}20`,
                transform: "translateY(-4px)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#6b7280",
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {stat.label}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: stat.color,
                  fontSize: "1.875rem",
                }}
              >
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  // Mapping để dịch trạng thái tiếng Anh sang Việt
  const orderStatusMap: Record<string, string> = {
    "PENDING": "Chờ xác nhận",
    "PROCESSING": "Đang xử lý",
    "COMPLETED": "Hoàn thành",
    "CANCELLED": "Huỷ",
    "DELIVERED": "Đã giao",
    "SHIPPING": "Đang giao",
    "UNKNOWN": "Chưa xác định",
    "APPROVED": "Đã duyệt",
    "Active": "Đang hoạt động",
    "Blocked": "Bị chặn",
  };

  const translateLabel = (text: string | number, category?: string): string => {
    // Convert to string if number
    const textStr = String(text);
    // Translate Order #123 to DH-123
    if (textStr?.startsWith("Order #")) {
      return textStr.replace("Order #", "DH-");
    }
    // Add prefix for pure numbers (order/customer IDs)
    if (/^\d+$/.test(textStr)) {
      const prefix = category === "customers" ? "KH" : "DH";
      return `${prefix}-${textStr}`;
    }
    // Try exact match first, then uppercase match
    return orderStatusMap[textStr] || orderStatusMap[textStr?.toUpperCase()] || textStr;
  };

  const renderBreakdown = () => {
    const categoryKey = categories[tabValue].key;
    const currentStats = stats[categoryKey as keyof typeof stats];
    
    // Transform breakdown data to translate labels
    const translatedBreakdown = currentStats?.breakdown?.map((item: any) => ({
      ...item,
      displayName: translateLabel(item.name, categoryKey),
    })) || [];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Time Series Chart */}
        {currentStats?.timeSeries && currentStats.timeSeries.length > 0 && (
          <Card
            sx={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ pb: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "1.125rem",
                  color: "#1f2937",
                }}
              >
                📈 Xu hướng theo thời gian
              </Typography>
              <Box sx={{ height: 350, width: "100%", position: "relative" }}>
                <ResponsiveLineCanvas
                  data={currentStats.timeSeries}
                  margin={{ top: 40, right: 110, bottom: 60, left: 70 }}
                  xScale={{ type: "point" }}
                  yScale={{ type: "linear", min: "auto", max: "auto" }}
                  curve="catmullRom"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 10,
                    tickRotation: -45,
                    legend: "Ngày",
                    legendOffset: 50,
                    legendPosition: "middle",
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 10,
                    tickRotation: 0,
                    legend: "Giá trị",
                    legendOffset: -50,
                    legendPosition: "middle",
                  }}
                  colors={{ scheme: "blues" }}
                  pointSize={6}
                  pointColor={{ theme: "background" }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "serieColor" }}
                  legends={[
                    {
                      anchor: "bottom-right",
                      direction: "column",
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 0,
                      itemDirection: "left-to-right",
                      itemWidth: 80,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: "circle",
                      symbolBorderColor: "rgba(0, 0, 0, .5)",
                      effects: [
                        {
                          on: "hover",
                          style: {
                            itemBackground: "rgba(0, 0, 0, .03)",
                            itemOpacity: 1,
                          },
                        },
                      ],
                    },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Breakdown Chart */}
        {translatedBreakdown && translatedBreakdown.length > 0 && (
          <Card
            sx={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ pb: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "1.125rem",
                  color: "#1f2937",
                }}
              >
                📊 Phân tích chi tiết
              </Typography>
              <Box sx={{ height: 350, width: "100%", position: "relative" }}>
                <ResponsiveBarCanvas
                  data={translatedBreakdown.slice(0, 10).map((item: any) => ({
                    name: item.displayName,
                    value: item.value,
                  }))}
                  keys={["value"]}
                  indexBy="name"
                  margin={{ top: 40, right: 130, bottom: 100, left: 70 }}
                  padding={0.5}
                  colors={({ index }) => {
                    const colorPalette = [
                      "#3b82f6", // Blue
                      "#10b981", // Green
                      "#f59e0b", // Amber
                      "#ef4444", // Red
                      "#8b5cf6", // Purple
                      "#ec4899", // Pink
                      "#06b6d4", // Cyan
                      "#f97316", // Orange
                      "#6366f1", // Indigo
                      "#14b8a6", // Teal
                    ];
                    return colorPalette[index % colorPalette.length];
                  }}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 10,
                    tickRotation: -45,
                    legend: "Danh mục",
                    legendPosition: "middle",
                    legendOffset: 60,
                    truncateTickAt: 80,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 10,
                    tickRotation: 0,
                    legend: "Giá trị",
                    legendPosition: "middle",
                    legendOffset: -50,
                  }}
                  theme={{
                    labels: {
                      text: {
                        fontSize: 12,
                        fill: "#374151",
                      },
                    },
                    tooltip: {
                      container: {
                        background: "#ffffff",
                        color: "#1f2937",
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        padding: "8px 12px",
                        fontSize: "12px",
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Top Items Pie Chart */}
        {currentStats?.topItems && currentStats.topItems.length > 0 && (
          <Card
            sx={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ pb: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "1.125rem",
                  color: "#1f2937",
                }}
              >
                🥇 Hàng đầu
              </Typography>
              <Box sx={{ height: 350, width: "100%", position: "relative" }}>
                <ResponsivePieCanvas
                  data={currentStats.topItems.slice(0, 8).map((item: any) => ({
                    ...item,
                    id: translateLabel(item.id, categoryKey),
                    label: translateLabel(item.id, categoryKey),
                  }))}
                  margin={{ top: 40, right: 80, bottom: 100, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  colors={{ scheme: "paired" }}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 0.6]],
                  }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333"
                  arcLabelsSkipAngle={10}
                  legends={[
                    {
                      anchor: "bottom",
                      direction: "row",
                      justify: false,
                      translateX: 0,
                      translateY: 60,
                      itemsSpacing: 10,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: "#666",
                      itemDirection: "left-to-right",
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: "circle",
                      effects: [
                        {
                          on: "hover",
                          style: {
                            itemTextColor: "#000",
                          },
                        },
                      ],
                    },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Fallback message */}
        {(!currentStats?.timeSeries || currentStats.timeSeries.length === 0) &&
          (!currentStats?.breakdown || currentStats.breakdown.length === 0) && (
            <Alert
              severity="info"
              sx={{
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                borderColor: "#3b82f6",
                color: "#1e40af",
              }}
            >
              Không có dữ liệu biểu đồ để hiển thị. Vui lòng thử thay đổi bộ lọc.
            </Alert>
          )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        mb={4}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2rem" },
              color: "#1f2937",
            }}
          >
            📊 Thống kê chi tiết
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#6b7280",
              fontSize: "0.95rem",
            }}
          >
            Phân tích dữ liệu kinh doanh theo danh mục
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setOpenFilter(true)}
            sx={{
              borderColor: "#d1d5db",
              color: "#374151",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            Bộ lọc
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            borderColor: "#ef4444",
            color: "#991b1b",
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Tabs with improved styling */}
      <Box sx={{ borderBottom: 2, borderColor: "#e5e7eb", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="các tab thống kê"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "#6b7280",
              "&.Mui-selected": {
                color: "#3b82f6",
              },
              textTransform: "none",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#3b82f6",
              height: 3,
            },
          }}
        >
          {categories.map((cat, idx) => (
            <Tab key={cat.key} label={cat.label} id={`analytics-tab-${idx}`} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {categories.map((cat, idx) => (
        <TabPanel
          key={cat.key}
          value={tabValue}
          index={idx}
          children={
            loading && tabValue === idx ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={50} sx={{ color: "#3b82f6" }} />
              </Box>
            ) : (
              <>
                {renderStatsOverview()}
                {renderBreakdown()}
              </>
            )
          }
        />
      ))}

      {/* Filter Dialog */}
      <Dialog open={openFilter} onClose={() => setOpenFilter(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#1f2937" }}>
          🔍 Lọc dữ liệu thống kê
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label="Từ ngày"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={
              filters[categories[tabValue].key as keyof typeof filters].startDate || ""
            }
            onChange={(e) =>
              handleFilterChange("startDate", e.target.value)
            }
            fullWidth
            variant="outlined"
            size="small"
          />
          <TextField
            label="Đến ngày"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={
              filters[categories[tabValue].key as keyof typeof filters].endDate || ""
            }
            onChange={(e) =>
              handleFilterChange("endDate", e.target.value)
            }
            fullWidth
            variant="outlined"
            size="small"
          />

          {/* Order status filter */}
          {categories[tabValue].key === "orders" && (
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái đơn hàng</InputLabel>
              <Select
                value={
                  filters.orders.orderStatus || ""
                }
                label="Trạng thái đơn hàng"
                onChange={(e) =>
                  handleFilterChange("orderStatus", e.target.value)
                }
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
                <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
                <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                <MenuItem value="CANCELLED">Huỷ</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Min/Max amount filter */}
          {(categories[tabValue].key === "orders" || categories[tabValue].key === "revenue") && (
            <>
              <TextField
                label="Số tiền tối thiểu"
                type="number"
                value={
                  filters[categories[tabValue].key as keyof typeof filters].minAmount || ""
                }
                onChange={(e) =>
                  handleFilterChange("minAmount", parseFloat(e.target.value))
                }
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Số tiền tối đa"
                type="number"
                value={
                  filters[categories[tabValue].key as keyof typeof filters].maxAmount || ""
                }
                onChange={(e) =>
                  handleFilterChange("maxAmount", parseFloat(e.target.value))
                }
                fullWidth
                variant="outlined"
                size="small"
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setOpenFilter(false)}
            sx={{ color: "#6b7280" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleApplyFilter}
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            }}
          >
            Áp dụng bộ lọc
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalyticsScreen;
