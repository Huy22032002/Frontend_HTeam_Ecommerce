import axios from "axios";
import { getAdminToken } from "../../utils/tokenUtils";

const API_BASE = import.meta.env.VITE_BASE_URL;

export const VariantsOptionsApi = {
  getAll: async (page: number, size: number) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/public/products/variants/options`,
        {
          params: { size, page },
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
  getAllOptions: async (page: number = 0, size: number = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/public/products/variants/options`,
        {
          params: { page, size },
        }
      );
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch all variants options:", error);
      return null;
    }
  },
  updateOption: async (optionId: number, data: any) => {
    try {
      // Normalize payload: backend expects availability.productStatus
      const normalized = { ...data };
      if (typeof data?.productStatus === 'boolean') {
        normalized.availability = { ...(data.availability || {}), productStatus: data.productStatus };
        delete normalized.productStatus;
      }
      const response = await axios.put(
        `${API_BASE}/api/admins/products/variants/options/${optionId}`,
        normalized,
        {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
          },
        }
      );
      if (response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: "Unable to update option", errorCode: 500 };
    } catch (error: any) {
      const errorMessage = error.response?.data?.errorMessage || "Error updating option";
      const errorCode = error.response?.status || 500;
      console.error("Failed to update option:", error);
      return { success: false, error: errorMessage, errorCode };
    }
  },
  deleteOption: async (optionId: number) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/admins/products/variants/options/${optionId}`,
        {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
          },
        }
      );
      if (response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: "Unable to delete option", errorCode: 500 };
    } catch (error: any) {
      const errorMessage = error.response?.data?.errorMessage || "Error deleting option";
      const errorCode = error.response?.status || 500;
      console.error("Failed to delete option:", error);
      return { success: false, error: errorMessage, errorCode };
    }
  },
};
