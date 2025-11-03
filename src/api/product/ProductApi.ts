import axios from "axios";
import type { Product } from "../../models/products/Product";
const API_BASE = import.meta.env.VITE_BASE_URL + "/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const ProductApi = {
  // Lấy danh sách sản phẩm (có phân trang)
  getAll: (page = 0, size = 20) =>
    axios.get(`${API_BASE}/admins/products?page=${page}&size=${size}`, {
      headers: getAuthHeader(),
    }),
  getAllByCategoryId: async (categoryId: number, page = 0, size = 20) => {
    try {
      const response = await axios.get(`${API_BASE}/public/products`, {
        params: { categoryId, page, size },
      });
      if (response.data) {
        console.log("product:", response.data);

        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch list product variants options:", error);
      return null;
    }
  },

  // Lấy chi tiết sản phẩm theo id
  getById: (id: number) =>
    axios.get(`${API_BASE}/products/${id}`, { headers: getAuthHeader() }),

  // Tạo sản phẩm mới
  create: (product: Product) =>
    axios.post(`${API_BASE}/admins/products`, product, { headers: getAuthHeader() }),

  // Tạo sản phẩm kèm biến thể và tuỳ chọn
  createFull: (data: any) =>
    axios.post(`${API_BASE}/admins/products/full-create`, data, { headers: getAuthHeader() }),

  // Thêm biến thể cho sản phẩm
  createVariant: (productId: number, data: any) =>
    axios.post(`${API_BASE}/products/${productId}/variants`, data, {
      headers: getAuthHeader(),
    }),

  // Cập nhật sản phẩm
  update: (id: number, product: Partial<Product>) =>
    axios.put(`${API_BASE}/products/${id}`, product, { headers: getAuthHeader() }),

  // Xoá sản phẩm
  delete: (id: number) =>
    axios.delete(`${API_BASE}/products/${id}`, { headers: getAuthHeader() }),
};
