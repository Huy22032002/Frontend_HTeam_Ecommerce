import axios from 'axios';
import { getAdminToken } from '../../utils/tokenUtils';

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + '/api/admins/invoices';

function getAuthHeader() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface InvoiceFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  date?: string;
}

export const InvoiceApi = {
  // Lấy danh sách hóa đơn với bộ lọc
  getAll: (filters: InvoiceFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return axios.get(`${API_BASE}?${params.toString()}`, { headers: getAuthHeader() });
  },

  // Lấy chi tiết hóa đơn theo id
  getById: (id: string) =>
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeader() }),

  // Lấy chi tiết hoá đơn đầy đủ
  getDetail: (id: string | number) =>
    axios.get(`${API_BASE}/${id}/detail`, { headers: getAuthHeader() }),

  // Lấy hóa đơn theo Order ID
  getByOrderId: (orderId: string | number) =>
    axios.get(`${import.meta.env.VITE_BASE_URL}/api/admins/orders/${orderId}/invoice`, { headers: getAuthHeader() }),

  // Tạo hóa đơn từ Order ID
  createFromOrder: (orderId: string | number) =>
    axios.post(`${import.meta.env.VITE_BASE_URL}/api/admins/orders/${orderId}/invoice`, {}, { headers: getAuthHeader() }),

  cancel: (invoiceId: string | number) =>
    axios.patch(`${API_BASE}/${invoiceId}/cancel`, {}, { headers: getAuthHeader() }),

  // Xuất danh sách hóa đơn ra Excel theo filter
  exportToExcel: (filters: InvoiceFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return axios.get(`${API_BASE}/export/excel?${params.toString()}`, {
      headers: getAuthHeader(),
      responseType: "blob",
    });
  },
};

