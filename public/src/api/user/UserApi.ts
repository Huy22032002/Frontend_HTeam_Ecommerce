import axios from "axios";
import type { UserSummary } from "../../models/dashboard/UserSummary";

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + "/api";
const ADMIN_API = API_BASE + "/admins";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const UserApi = {
  // Lấy danh sách người dùng (có phân trang) - endpoint admin
  getAll: (page = 0, size = 20) =>
    axios.get(`${ADMIN_API}/users?page=${page}&size=${size}`, {
      headers: getAuthHeader(),
    }),

  // Lấy chi tiết người dùng theo id
  getById: (id: number) =>
    axios.get(`${ADMIN_API}/${id}`, { headers: getAuthHeader(), timeout: 8000 }),

  // Tạo người dùng mới
  create: (user: Partial<UserSummary>) =>
    axios.post(`${ADMIN_API}`, user, { headers: getAuthHeader() }),

  // Cập nhật người dùng
  update: (id: string, user: Partial<UserSummary>) =>
    axios.put(`${ADMIN_API}/${id}`, user, { headers: getAuthHeader() }),

  // Xoá người dùng
  delete: (id: string) =>
    axios.delete(`${ADMIN_API}/${id}`, { headers: getAuthHeader() }),

  // Cập nhật trạng thái active/inactive của người dùng
  toggleUserActive: (id: number) =>
    axios.put(`${ADMIN_API}/${id}/toggle-active`, {}, { headers: getAuthHeader() }),

  // Đăng nhập người dùng
  login: (username: string, password: string) =>
    axios.post(`${ADMIN_API}/login`, { username, password }, { timeout: 10000 }),

  // Đăng ký người dùng mới
  register: (user: Partial<UserSummary>) =>
    axios.post(`${ADMIN_API}/register`, user, { headers: getAuthHeader() }),

  // Đăng xuất người dùng
  logout: () => {
    localStorage.removeItem("token");
  },

  // Quên mật khẩu
  forgotPassword: (phone: string) =>
    axios.post(`${ADMIN_API}/forgot-password`, { phone }),

  // Đặt lại mật khẩu (nhập khẩu cũ để kiểm tra sau đó đặt mật khẩu mới)
  resetPassword: (oldPassword: string, newPassword: string) =>
    axios.post(`${ADMIN_API}/reset-password`, { oldPassword, newPassword, }, { headers: getAuthHeader() }),

  // Cập nhật trạng thái blocked/unblocked của người dùng
  toggleUserBlocked: (id: number) =>
    axios.put(`${ADMIN_API}/${id}/toggle-blocked`, {}, { headers: getAuthHeader() }),

};
