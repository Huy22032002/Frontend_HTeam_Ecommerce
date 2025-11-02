const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";

export const CustomerLogApi = {
  /**
   * Log product view in current session
   * @param variantId - Product variant ID
   */
  logProductView: async (variantId: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${backendEndpoint}/api/customers/logs/product-view?variantId=${variantId}`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.status === 200;
    } catch (error: any) {
      console.error("Failed to log product view:", error?.response?.data || error?.message);
      return false;
    }
  },
};
