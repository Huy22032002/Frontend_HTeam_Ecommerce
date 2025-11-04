import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL;

export const VariantsApi = {
  getAll: async (page: number, size: number = 5) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/public/products/variants`,
        {
          params: { page, size },
        }
      );
      if (response.data) {
        console.log("product:", response.data);

        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch list product variants options:", error);
      return null;
    }
  },
  getById: async (variantId: number) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/public/product/variant/${variantId}`
      );
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch product variant:", error);
      return null;
    }
  },
};
