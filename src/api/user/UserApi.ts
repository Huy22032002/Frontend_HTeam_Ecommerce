import axios from "axios";
import type { UserSummary } from "../../models/dashboard/UserSummary";

const API_BASE = import.meta.env.VITE_BASE_URL + "/api/users";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const UserApi = {
  // Lấy danh sách người dùng (có phân trang)
  getAll: (page = 0, size = 20) =>
    axios.get(`${API_BASE}?page=${page}&size=${size}`, {
      headers: getAuthHeader(),
    }),

  // Lấy chi tiết người dùng theo id
  getById: (id: string) =>
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeader() }),

  // Tạo người dùng mới
  create: (user: Partial<UserSummary>) =>
    axios.post(`${API_BASE}`, user, { headers: getAuthHeader() }),

  // Cập nhật người dùng
  update: (id: string, user: Partial<UserSummary>) =>
    axios.put(`${API_BASE}/${id}`, user, { headers: getAuthHeader() }),

  // Xoá người dùng
  delete: (id: string) =>
    axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeader() }),
};
