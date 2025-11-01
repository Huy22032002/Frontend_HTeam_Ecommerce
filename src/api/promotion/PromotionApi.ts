import axios from 'axios';

const API_BASE = import.meta.env.VITE_BASE_URL + '/api';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PromotionFilters {
  page?: number;
  size?: number;
}

export const PromotionApi = {
  // Lấy khuyến mãi active theo SKU sản phẩm (công khai - không cần token)
  getByProductSku: (sku: string) =>
    axios.get(`${API_BASE}/promotions/by-product-sku?sku=${sku}`),

  // Lấy tất cả khuyến mãi (admin)
  getAll: (filters: PromotionFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return axios.get(`${API_BASE}/admins/promotions?${params.toString()}`, { headers: getAuthHeader() });
  },

  // Lấy danh sách khuyến mãi theo trạng thái active (admin)
  getByActive: (active: boolean) =>
    axios.get(`${API_BASE}/admins/promotions/active?active=${active}`, { headers: getAuthHeader() }),

  // Tạo khuyến mãi mới (admin)
  create: (data: any) =>
    axios.post(`${API_BASE}/admins/promotions`, data, { headers: getAuthHeader() }),

  // Xóa khuyến mãi (admin)
  delete: (id: number) =>
    axios.delete(`${API_BASE}/admins/promotions/${id}`, { headers: getAuthHeader() }),

  // Cập nhật trạng thái active (admin)
  setActive: (id: number, active: boolean) =>
    axios.post(`${API_BASE}/admins/promotions/set-active`, { id, active }, { headers: getAuthHeader() }),
};
