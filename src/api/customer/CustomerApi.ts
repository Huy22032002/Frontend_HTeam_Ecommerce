const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";
import type { ReadableCustomer } from "../../models/customer/ReadableCustomer";
import type { UpdateCustomer } from "../../models/customer/UpdateCustomer";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const CustomerApi = {
  getById: async (customerId: string): Promise<ReadableCustomer | null> => {
    try {
      console.log("Token:", localStorage.getItem("token"));
      const response = await axios.get<ReadableCustomer>(
        `${backendEndpoint}/api/customers/${customerId}`,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Failed to fetch customer:",
        error?.response?.data || error?.message
      );
      return null;
    }
  },
  updateInfo(id: number, data: UpdateCustomer) {
    return axios.put(`${backendEndpoint}/api/customers/${id}`, data, {
      headers: getAuthHeader(),
      withCredentials: true,
    });
  },
  changePassword(id: number, currentPassword: string, newPassword: string) {
    const data = {
      oldPassword: currentPassword,
      newPassword: newPassword,
    };

    return axios.post(
      `${backendEndpoint}/api/customers/${id}/change-password`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
  },
  // Toggle customer blocked status (admin only)
  toggleCustomerBlocked(id: number) {
    return axios.put(
      `${backendEndpoint}/api/admins/customers/${id}/toggle-blocked`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
  },
};
