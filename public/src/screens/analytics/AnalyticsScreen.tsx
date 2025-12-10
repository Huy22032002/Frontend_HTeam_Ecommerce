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
  Download as DownloadIcon,
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

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const categoryKey = categories[tabValue].key;
      const filter = filters[categoryKey as keyof typeof filters];
      const response = await AnalyticsApi.exportToExcel(filter);

      // Create blob and download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${categoryKey}-analytics-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting Excel:", err);
      setError("Lỗi khi xuất file Excel");
    } finally {
      setLoading(false);
    }
  };

  const renderStatsOverview = () => {
    const categoryKey = categories[tabValue].key;
    const currentStats = stats[categoryKey as keyof typeof stats];

    if (!currentStats) {
      return <CircularProgress />;
    }

    return (
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Tổng số
            </Typography>
            <Typography variant="h5">
              {currentStats.totalCount?.toLocaleString("vi-VN") || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Tổng tiền
            </Typography>
            <Typography variant="h5">
              {currentStats.totalAmount
                ? (currentStats.totalAmount / 1000000).toFixed(1) + "M"
                : "0"}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Trung bình
            </Typography>
            <Typography variant="h5">
              {currentStats.averageAmount
                ? (currentStats.averageAmount / 1000000).toFixed(1) + "M"
                : "0"}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Bản ghi
            </Typography>
            <Typography variant="h5">
              {currentStats.recordsFiltered}/{currentStats.recordsTotal}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderBreakdown = () => {
    const categoryKey = categories[tabValue].key;
    const currentStats = stats[categoryKey as keyof typeof stats];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Time Series Chart */}
        {currentStats?.timeSeries && currentStats.timeSeries.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Xu hướng theo thời gian
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveLineCanvas
                  data={currentStats.timeSeries}
                  margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                  xScale={{ type: "point" }}
                  yScale={{ type: "linear", min: "auto", max: "auto" }}
                  curve="catmullRom"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Ngày",
                    legendOffset: 36,
                    legendPosition: "middle",
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Giá trị",
                    legendOffset: -40,
                    legendPosition: "middle",
                  }}
                  colors={{ scheme: "blue_purple" }}
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
        {currentStats?.breakdown && currentStats.breakdown.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Phân tích chi tiết
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveBarCanvas
                  data={currentStats.breakdown.slice(0, 10)}
                  keys={["value"]}
                  indexBy="name"
                  margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                  padding={0.3}
                  colors={{ scheme: "nivo" }}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: "Danh mục",
                    legendPosition: "middle",
                    legendOffset: 40,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Giá trị",
                    legendPosition: "middle",
                    legendOffset: -40,
                  }}
                  legends={[
                    {
                      dataFrom: "keys",
                      anchor: "bottom-right",
                      direction: "column",
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 2,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: "square",
                      symbolBorderColor: "rgba(0, 0, 0, .5)",
                      effects: [
                        {
                          on: "hover",
                          style: {
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

        {/* Top Items Pie Chart */}
        {currentStats?.topItems && currentStats.topItems.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🥇 Hàng đầu
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsivePieCanvas
                  data={currentStats.topItems.slice(0, 8)}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  colors={{ scheme: "category10" }}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 0.6]],
                  }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#000000"
                  arcLabelsSkipAngle={10}
                  legends={[
                    {
                      anchor: "bottom",
                      direction: "row",
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: "#999",
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
            <Alert severity="info">Không có dữ liệu biểu đồ để hiển thị</Alert>
          )}
      </Box>
    );
  };

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
            📊 Thống kê
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Xem thống kê chi tiết các danh mục
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setOpenFilter(true)}
          >
            Lọc
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            disabled={loading}
          >
            Xuất Excel
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="analytics tabs"
        >
          {categories.map((cat, idx) => (
            <Tab key={cat.key} label={cat.label} id={`analytics-tab-${idx}`} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {categories.map((cat, idx) => (
        <TabPanel key={cat.key} value={tabValue} index={idx}>
          {loading && tabValue === idx ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {renderStatsOverview()}
              {renderBreakdown()}
            </>
          )}
        </TabPanel>
      ))}

      {/* Filter Dialog */}
      <Dialog open={openFilter} onClose={() => setOpenFilter(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lọc dữ liệu</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
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
          />

          {/* Order status filter */}
          {categories[tabValue].key === "orders" && (
            <FormControl fullWidth>
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
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilter(false)}>Huỷ</Button>
          <Button
            onClick={handleApplyFilter}
            variant="contained"
            disabled={loading}
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalyticsScreen;
