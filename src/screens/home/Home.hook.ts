import { useState } from "react";
import { fetchListCategories } from "../../api/catalog/CategoryApi";
import type { Category } from "../../models/catalogs/Category";

const useHome = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const getAllCategories = async () => {
    const data = await fetchListCategories();
    setCategories(data);
  };

  return { categories, setCategories, getAllCategories };
};

export default useHome;
