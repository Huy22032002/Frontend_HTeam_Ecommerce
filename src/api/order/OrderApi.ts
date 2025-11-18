import axios from "axios";
import type { Order } from "../../models/dashboard/Order";

const API_BASE = import.meta.env.VITE_BASE_URL + "/api/admins/orders";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Define a type for the filter parameters
export interface OrderFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  paymentStatus?: string;
}

export const OrderApi = {
  // Lấy danh sách đơn hàng với bộ lọc
  getAll: (filters: OrderFilters) => {
    // Convert the filters object to URL query parameters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    return axios.get(`${API_BASE}?${params.toString()}`, {
      headers: getAuthHeader(),
    });
  },

  // Lấy chi tiết đơn hàng theo id
  getById: (id: string) =>
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeader() }),

  // Lấy chi tiết đơn hàng theo id cho khách hàng
  getByIdOfCustomer: (id: string) =>
    axios.get(`http://localhost:8080/api/customers/orders/${id}`, {
      headers: getAuthHeader(),
    }),

  // Tạo đơn hàng mới
  create: (order: Partial<Order>) =>
    axios.post(`${API_BASE}`, order, { headers: getAuthHeader() }),

  // Cập nhật đơn hàng
  update: (id: string, order: Partial<Order>) =>
    axios.put(`${API_BASE}/${id}`, order, { headers: getAuthHeader() }),

  // Xoá đơn hàng
  delete: (id: string) =>
    axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeader() }),

  // Khách hàng tạo dơn hàng
  createByCustomer: (order: Partial<Order>) =>
    axios.post(`${import.meta.env.VITE_BASE_URL}/api/customers/orders`, order, {
      headers: getAuthHeader(),
    }),

  // Lấy lịch sử đơn hàng của customer theo id
  getByCustomerId: (customerId: string, page: number = 0, size: number = 20) =>
    axios.get(
      `${
        import.meta.env.VITE_BASE_URL
      }/api/customers/${customerId}/orders?page=${page}&size=${size}`,
      { headers: getAuthHeader() }
    ),

  // Huỷ đơn hàng của customer
  cancelByCustomer: (orderId: string | number) =>
    axios.delete(
      `${import.meta.env.VITE_BASE_URL}/api/customers/orders/${orderId}`,
      { headers: getAuthHeader() }
    ),

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: (id: string | number, status: string) =>
    axios.put(
      `${API_BASE}/${id}/status`,
      { status },
      { headers: getAuthHeader() }
    ),

  // Xuất danh sách đơn hàng ra Excel theo filter
  exportToExcel: (filters: OrderFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    return axios.get(`${API_BASE}/export/excel?${params.toString()}`, {
      headers: getAuthHeader(),
      responseType: "blob",
    });
  },
};

