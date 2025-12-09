import axios from "axios";

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + "/api/admins/dashboard";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface DashboardKPIDTO {
  title: string;
  value: number;
  percentageChange: number;
  icon: string;
  color: string;
}

export interface RecentOrderDTO {
  id: number;
  orderCode: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface NewCustomerDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface MonthlyRevenueDTO {
  month: string;
  revenue: number;
}

export const DashboardApi = {
  // Lấy tất cả KPI metrics
  getKPIs: () => axios.get(`${API_BASE}/kpis`, { headers: getAuthHeader() }),

  // Lấy đơn hàng gần đây
  getRecentOrders: () =>
    axios.get(`${API_BASE}/recent-orders`, { headers: getAuthHeader() }),

  // Lấy khách hàng mới
  getNewCustomers: () =>
    axios.get(`${API_BASE}/recent-users`, { headers: getAuthHeader() }),

  // Lấy thống kê trạng thái đơn hàng
  getOrderStatusDistribution: () =>
    axios.get(`${API_BASE}/order-status-distribution`, {
      headers: getAuthHeader(),
    }),

  // Lấy doanh thu theo tháng
  getMonthlyRevenue: () =>
    axios.get(`${API_BASE}/monthly-revenue`, { headers: getAuthHeader() }),
};
