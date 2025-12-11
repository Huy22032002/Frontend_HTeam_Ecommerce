import axios from 'axios';
import { getAdminToken } from '../../utils/tokenUtils';

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + '/api/admins/customers';

function getAuthHeader() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface CustomerFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export const CustomerAdminApi = {
  // Lấy danh sách khách hàng với phân trang
  getAll: (page = 0, size = 20) =>
    axios.get(`${API_BASE}?page=${page}&size=${size}`, {
      headers: getAuthHeader(),
    }),

  // Lấy chi tiết khách hàng theo id
  getById: (id: number) =>
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeader() }),

  // Toggle trạng thái chặn khách hàng
  toggleCustomerBlocked: (id: number) =>
    axios.put(`${API_BASE}/${id}/toggle-blocked`, {}, {
      headers: getAuthHeader(),
    }),
};
