const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";
import type { Manufacturer } from "../../models/manufacturer/Manufacturer";

export const ManufacturerApi = {
  getAllByCategoryId: async (
    categoryId: number
  ): Promise<Manufacturer[] | null> => {
    try {
      const response = await axios.get(
        `${backendEndpoint}/api/public/manufacturers`,
        {
          params: { categoryId: categoryId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      return null;
    }
  },
};
