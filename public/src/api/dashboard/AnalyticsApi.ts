import axios from "axios";

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + "/api/admins/dashboard";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AnalyticsFilterDTO {
  startDate?: string;
  endDate?: string;
  category: string;
  orderStatus?: string;
  productCategory?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  region?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface DetailedStatsDTO {
  categoryName: string;
  totalCount: number;
  totalAmount: number;
  averageAmount?: number;
  percentageChange?: number;
  timeSeries: any[];
  breakdown: any[];
  topItems: any[];
  filterApplied: Record<string, any>;
  recordsTotal: number;
  recordsFiltered: number;
}

export const AnalyticsApi = {
  // Lấy thống kê chi tiết theo danh mục
  getDetailedAnalytics: (filter: AnalyticsFilterDTO) =>
    axios.post(`${API_BASE}/analytics/detailed`, filter, { 
      headers: getAuthHeader() 
    }),

  // Xuất file Excel
  exportToExcel: (filter: AnalyticsFilterDTO) =>
    axios.post(`${API_BASE}/analytics/export-excel`, filter, {
      headers: getAuthHeader(),
      responseType: "blob",
    }),
};
