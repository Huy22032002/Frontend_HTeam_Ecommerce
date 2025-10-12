// <reference types="vite/client" />
import axios from 'axios';
import type { Product } from '../../models/catalogs/Product';
const API_BASE = import.meta.env.VITE_BASE_URL + '/api/products';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const ProductApi = {
  // Lấy danh sách sản phẩm (có phân trang)
  getAll: (page = 0, size = 20) =>
    axios.get(`${API_BASE}?page=${page}&size=${size}`, { headers: getAuthHeader() }),

  // Lấy chi tiết sản phẩm theo id
  getById: (id: number) =>
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeader() }),

  // Tạo sản phẩm mới
  create: (product: Product) =>
    axios.post(`${API_BASE}`, product, { headers: getAuthHeader() }),

  // Tạo sản phẩm kèm biến thể và tuỳ chọn
  createFull: (data: any) =>
    axios.post(`${API_BASE}/full-create`, data, { headers: getAuthHeader() }),

  // Thêm biến thể cho sản phẩm
  createVariant: (productId: number, data: any) =>
    axios.post(`${API_BASE}/${productId}/variants`, data, { headers: getAuthHeader() }),

  // Cập nhật sản phẩm
  update: (id: number, product: Partial<Product>) =>
    axios.put(`${API_BASE}/${id}`, product, { headers: getAuthHeader() }),

  // Xoá sản phẩm
  delete: (id: number) =>
    axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeader() }),
};
