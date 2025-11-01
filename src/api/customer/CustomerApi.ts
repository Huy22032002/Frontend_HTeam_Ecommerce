const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";
import type { ReadableCustomer } from "../../models/customer/ReadableCustomer";

const token = localStorage.getItem("token");

export const CustomerApi = {
  getById: async (customerId: string): Promise<ReadableCustomer | null> => {
    try {
      console.log("Token:", token);
      const response = await axios.get<ReadableCustomer>(
        `${backendEndpoint}/api/customers/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      return null;
    }
  },
};
