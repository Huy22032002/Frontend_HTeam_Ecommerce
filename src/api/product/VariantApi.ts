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
  getRecommendations: async (limit: number = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/public/recommendations`,
        {
          params: { limit },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data) {
        console.log("recommendations:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      return [];
    }
  },
  search: async (searchTerm: string, page: number = 0, size: number = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/public/search`,
        {
          params: {
            productName: searchTerm,
            page,
            size,
          },
        }
      );
      if (Array.isArray(response.data)) {
        console.log("search results:", response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Failed to search products:", error);
      return [];
    }
  },
  searchWithFilters: async (filters: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    hasSalePrice?: boolean;
    manufacturers?: string[];
    categories?: string[];
    page?: number;
    size?: number;
  }) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/public/search/filters`,
        {
          name: filters.name || "",
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          available: filters.available,
          hasSalePrice: filters.hasSalePrice || false,
          manufacturers: filters.manufacturers || [],
          categories: filters.categories || [],
          page: filters.page || 0,
          size: filters.size || 20,
        }
      );
      if (Array.isArray(response.data)) {
        console.log("filtered search results:", response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Failed to search products with filters:", error);
      return [];
    }
  },
};

