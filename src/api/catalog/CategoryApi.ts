import axios, { type AxiosResponse } from "axios";
import type { Category } from "../../models/catalogs/Category";
import { Category } from "@mui/icons-material";

const API_BASE = import.meta.env.VITE_BASE_URL + "/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const CategoryApi = {
  // Lấy danh sách danh mục không phân trang - public
  getAll: () =>
    axios.get(`${API_BASE}/public/categories`),

  // Lấy danh sách danh mục (có phân trang) - public
  getAllPaging: (page = 0, size = 20) =>
    axios.get(`${API_BASE}/public/categories?page=${page}&size=${size}`),

  // Lấy danh sách danh mục không phân trang - public
  getAllNoPaging: (): Promise<Category[]> =>
    axios.get(`${API_BASE}/public/categories`).then((res) => res.data),

  // Lấy chi tiết danh mục theo id
  getById: (id: string) =>
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeader() }),

  // Tạo danh mục mới
  create: (category: Partial<Category>) =>
    axios.post(`${API_BASE}`, category, { headers: getAuthHeader() }),

  // Cập nhật danh mục
  update: (id: string, category: Partial<Category>) =>
    axios.put(`${API_BASE}/${id}`, category, { headers: getAuthHeader() }),

  // Xoá danh mục
  delete: (id: string) =>
    axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeader() }),
};
