import axios from 'axios';
import type { PromotionReadableDTO } from '../../models/promotions/Promotion';

const API_BASE = import.meta.env.VITE_BASE_URL + '/api/promotions';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PromotionFilters {
  page?: number;
  size?: number;
}

export const PromotionApi = {
  // Lấy danh sách khuyến mãi
  getAll: (filters: PromotionFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return axios.get(`${API_BASE}?${params.toString()}`, { headers: getAuthHeader() });
  },

  // Lấy chi tiết khuyến mãi theo id
  getById: (id: string) =>
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeader() }),

  // Tạo khuyến mãi mới
  create: (data: any) =>
    axios.post(`${API_BASE}`, data, { headers: getAuthHeader() }),

  // Cập nhật khuyến mãi
  update: (id: string, data: any) =>
    axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeader() }),

  // Xóa khuyến mãi
  delete: (id: string) =>
    axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeader() }),
};
