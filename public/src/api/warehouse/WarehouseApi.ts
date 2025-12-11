import axios from 'axios';
import { getAdminToken } from '../../utils/tokenUtils';

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + '/api/warehouses';

function getAuthHeader() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface WarehouseFilters {
  page?: number;
  size?: number;
}

export const WarehouseApi = {
  // Lấy danh sách kho hàng
  getAll: (filters: WarehouseFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return axios.get(`${API_BASE}?${params.toString()}`, { headers: getAuthHeader() });
  },

  // Lấy chi tiết kho hàng theo id
  getById: (id: string) =>
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeader() }),

  // Lấy sản phẩm không kinh doanh trong kho
  getInactiveProducts: (warehouseId: string, page = 0, size = 20) =>
    axios.get(`${API_BASE}/${warehouseId}/inactive-products?page=${page}&size=${size}`, {
      headers: getAuthHeader(),
    }),
};
