import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

export const NotificationApi = {
  getUnreadCustomerNotification: async (customerId: number) => {
    if (!customerId) return;
    try {
      const response = await axios.get(
        `${API_BASE}/api/customers/${customerId}/notifications/unread`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      if (error.response) throw new Error(error.response.data);
      throw new Error("Không thê kết nối đến Server!");
    }
  },
  getAllByCustomer: async (customerId: number) => {
    if (!customerId) return;
    try {
      const response = await axios.get(
        `${API_BASE}/api/customers/${customerId}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) return response.data;
      return [];
    } catch (error: any) {
      if (error.response) throw new Error(error.response.data);
      throw new Error("Không thể kết nối tới Server");
    }
  },
  markAsRead: async (customerId: number, id: number) => {
    if (customerId == null || id == null) return;

    try {
      const response = await axios.patch(
        `${API_BASE}/api/customers/${customerId}/notification/${id}/mark-as-read`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return !!response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Lỗi từ server!");
      }
      throw new Error("Không thể kết nối tới Server!");
    }
  },
};
