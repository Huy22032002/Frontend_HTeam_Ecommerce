import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

export const VariantsOptionsApi = {
  getAll: async (page: number, size: number) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/public/products/variants/options`,
        {
          params: { size, page },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch list product variants options:", error);
      return null;
    }
  },
};
