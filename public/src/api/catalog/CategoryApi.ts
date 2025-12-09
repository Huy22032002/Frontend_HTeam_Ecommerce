import axios from "axios";
import type { Category } from "../../models/catalogs/Category";

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + "/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const CategoryApi = {
  // Lấy danh sách danh mục không phân trang - public
  getAll: () => axios.get(`${API_BASE}/public/categories`),

  // Lấy danh sách danh mục (có phân trang) - public
  getAllPaging: (page = 0, size = 20) =>
    axios.get(`${API_BASE}/public/categories?page=${page}&size=${size}`),

  // Lấy danh sách danh mục không phân trang - public
  getAllNoPaging: (): Promise<Category[]> =>
    axios.get(`${API_BASE}/public/categories`).then((res) => res.data),

  // Lấy chi tiết danh mục theo id - admin
  getById: (id: number) =>
    axios.get(`${API_BASE}/admins/categories/${id}`, {
      headers: getAuthHeader(),
    }),

  // Tạo danh mục mới - admin
  create: (category: Partial<Category>) =>
    axios.post(`${API_BASE}/admins/category`, category, {
      headers: getAuthHeader(),
    }),

  // Cập nhật danh mục - admin
  update: (id: number, category: Partial<Category>) =>
    axios.put(`${API_BASE}/admins/categories/${id}`, category, {
      headers: getAuthHeader(),
    }),

  // Đổi trạng thái visible danh mục - admin
  toggleVisible: (id: number) =>
    axios.put(
      `${API_BASE}/admins/categories/${id}/toggle-visible`,
      {},
      { headers: getAuthHeader() }
    ),

  // Xoá danh mục - admin
  delete: (id: number) =>
    axios.delete(`${API_BASE}/admins/categories/${id}`, {
      headers: getAuthHeader(),
    }),
};
