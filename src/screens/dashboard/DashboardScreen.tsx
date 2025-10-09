import { Box, Typography, CircularProgress, Alert, Button } from "@mui/material";
import { useDashboard } from "./Dashboard.hook";
import { StatsGrid } from "../../components/dashboard/StatsGrid";
import { OrdersTable } from "../../components/dashboard/OrdersTable";
import { UsersTable } from "../../components/dashboard/UsersTable";
import { ActivityTimeline } from "../../components/dashboard/ActivityTimeline";
import { CmsLayout } from "../../components/cms/CmsLayout";

const DashboardScreen = () => {
  const { kpis, orders, users, activities, loading, error, reload } = useDashboard();

  return (
    <CmsLayout>
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight={600}>Bảng điều khiển</Typography>
        <Button variant="contained" onClick={reload}>Tải lại</Button>
      </Box>
      {loading && (
        <Box display="flex" justifyContent="center" my={6}><CircularProgress /></Box>
      )}
      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
      {!loading && !error && (
        <>
          <StatsGrid kpis={kpis} />
          <Box mt={3} display="grid" gridTemplateColumns={{ xs: '1fr', lg: '2fr 1fr' }} gap={2}>
            <OrdersTable orders={orders} />
            <UsersTable users={users} />
          </Box>
          <Box mt={2}>
            <ActivityTimeline items={activities} />
          </Box>
        </>
      )}
    </CmsLayout>
  );
};

export default DashboardScreen;
