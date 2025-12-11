import axios from 'axios';
import { getAdminToken } from '../../utils/tokenUtils';

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + '/api';

function getAuthHeader() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PromotionFilters {
  page?: number;
  size?: number;
}

export interface CreatePromotionDTO {
  code: string;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableProductOptionIds?: number[];
}

export interface UpdatePromotionDTO {
  id: number;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableProductOptionIds?: number[];
}

export const PromotionApi = {
  // Lấy khuyến mãi active theo SKU sản phẩm (công khai - không cần token)
  getByProductSku: (sku: string) =>
    axios.get(`${API_BASE}/public/promotions/by-product-sku?sku=${sku}`),

  // Lấy tất cả khuyến mãi active (công khai - không cần token)
  getAllActive: (filters: PromotionFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return axios.get(`${API_BASE}/public/promotions/active?${params.toString()}`);
  },

  // Lấy promotion by ID (công khai - không cần token)
  getById: (id: number) =>
    axios.get(`${API_BASE}/public/promotions/${id}`),

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
  create: (data: CreatePromotionDTO) => {
    console.log('[PromotionApi.create] Sending data:', data);
    return axios.post(`${API_BASE}/admins/promotions`, data, { headers: getAuthHeader() });
  },

  // Cập nhật khuyến mãi (admin)
  update: (id: number, data: UpdatePromotionDTO) => {
    console.log('[PromotionApi.update] Sending data:', data);
    return axios.put(`${API_BASE}/admins/promotions/${id}`, data, { headers: getAuthHeader() });
  },

  // Xóa khuyến mãi (admin)
  delete: (id: number) =>
    axios.delete(`${API_BASE}/admins/promotions/${id}`, { headers: getAuthHeader() }),

  // Cập nhật trạng thái active (admin)
  setActive: (id: number, active: boolean) =>
    axios.post(`${API_BASE}/admins/promotions/${id}/set-active?active=${active}`, {}, { headers: getAuthHeader() }),

  // Thêm sản phẩm vào danh sách áp dụng khuyến mãi (admin)
  addProductOption: (promotionId: number, productOptionId: number) =>
    axios.post(`${API_BASE}/admins/promotions/${promotionId}/add-product/${productOptionId}`, {}, { headers: getAuthHeader() }),

  // Xóa sản phẩm khỏi danh sách áp dụng khuyến mãi (admin)
  removeProductOption: (promotionId: number, productOptionId: number) =>
    axios.delete(`${API_BASE}/admins/promotions/${promotionId}/remove-product/${productOptionId}`, { headers: getAuthHeader() }),
};
