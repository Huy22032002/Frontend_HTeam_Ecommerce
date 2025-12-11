import axios from 'axios';
import { getAdminToken } from '../../utils/tokenUtils';

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + '/api/admins/payments';

function getAuthHeader() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PaymentFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  date?: string;
}

export const PaymentApi = {
  // Lấy danh sách thanh toán với bộ lọc
  getAll: (filters: PaymentFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return axios.get(`${API_BASE}?${params.toString()}`, { headers: getAuthHeader() });
  },

  // Lấy chi tiết thanh toán theo id
  getById: (id: string) =>
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeader() }),
};
