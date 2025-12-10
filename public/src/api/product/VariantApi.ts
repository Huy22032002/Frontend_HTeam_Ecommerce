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
      const token = localStorage.getItem("token");
      const config: any = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await axios.get(
        `${API_BASE}/api/public/product/variant/${variantId}`,
        config
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
      const token = localStorage.getItem("token");
      const config: any = {
        params: { limit },
      };
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await axios.get(
        `${API_BASE}/api/public/recommendations`,
        config
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
    sortBy?: string;
    sortOrder?: string;
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
          sortBy: filters.sortBy || "newest",
          sortOrder: filters.sortOrder || "desc",
          page: filters.page || 0,
          size: filters.size || 20,
        }
      );
      if (response.data) {
        console.log("filtered search results:", response.data);
        const result = {
          ...response.data,
          totalElements: response.data.totalItems || response.data.totalElements || 0,
          currentPage: (response.data.currentPage || 1) - 1, // Convert to 0-indexed for consistency
        };
        console.log("[searchWithFilters] Mapped result:", { total: result.totalElements, pages: result.totalPages });
        return result;
      }
      return { content: [], totalPages: 0, totalElements: 0, totalItems: 0, currentPage: 0 };
    } catch (error) {
      console.error("Failed to search products with filters:", error);
      return { content: [], totalPages: 0, totalElements: 0, totalItems: 0, currentPage: 0 };
    }
  },
  updateVariant: async (variantId: number, data: any) => {
    try {
      const response = await axios.put(
        `${API_BASE}/api/admin/products/variants/${variantId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: "Unable to update variant", errorCode: 500 };
    } catch (error: any) {
      const errorMessage = error.response?.data?.errorMessage || "Error updating variant";
      const errorCode = error.response?.status || 500;
      console.error("Failed to update variant:", error);
      return { success: false, error: errorMessage, errorCode };
    }
  },
  deleteVariant: async (variantId: number) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/admin/products/variants/${variantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: "Unable to delete variant", errorCode: 500 };
    } catch (error: any) {
      const errorMessage = error.response?.data?.errorMessage || "Error deleting variant";
      const errorCode = error.response?.status || 500;
      console.error("Failed to delete variant:", error);
      return { success: false, error: errorMessage, errorCode };
    }
  },
};

