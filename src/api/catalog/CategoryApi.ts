import axios from "axios";
import type { Category } from "../../models/catalogs/Category";

const backendEndpoint = import.meta.env.VITE_BASE_URL;

export const fetchListCategories = async () => {
  try {
    const response = await axios.get<Category[]>(
      `${backendEndpoint}/api/public/categories`
    );

    if (response.data) {
      return response.data || [];
    }
    return [];
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data;
    }
  }
};
