import axios from "axios";
import type { UserSummary } from "../../models/dashboard/UserSummary";

const API_BASE = import.meta.env.VITE_BASE_URL + "/api/admin";

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

  // Đăng nhập người dùng
  login: (username: string, password: string) =>
    axios.post(`${API_BASE}/login`, { username, password }),

  // Đăng ký người dùng mới
  register: (user: Partial<UserSummary>) =>
    axios.post(`${API_BASE}/register`, user),

  // Đăng xuất người dùng
  logout: () => {
    localStorage.removeItem("token");
  },

  // Quên mật khẩu
  forgotPassword: (phone: string) =>
    axios.post(`${API_BASE}/forgot-password`, { phone }),

  // Đặt lại mật khẩu (nhập khẩu cũ để kiểm tra sau đó đặt mật khẩu mới)
  resetPassword: (oldPassword: string, newPassword: string) =>
    axios.post(`${API_BASE}/reset-password`, { oldPassword, newPassword, }, { headers: getAuthHeader() }),

  

};
