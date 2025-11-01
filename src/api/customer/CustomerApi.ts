const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";
import type { ReadableCustomer } from "../../models/customer/ReadableCustomer";

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
      console.error("Failed to fetch customer:", error?.response?.data || error?.message);
      return null;
    }
  },
};
