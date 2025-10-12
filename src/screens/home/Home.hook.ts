import { useState } from "react";
import { CategoryApi } from "../../api/catalog/CategoryApi";
import type { Category } from "../../models/catalogs/Category";

const useHome = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const getAllCategories = async () => {
    try {
      const response = await CategoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  return { categories, setCategories, getAllCategories };
};

export default useHome;
