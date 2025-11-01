import { useState } from "react";
//apis
import { CategoryApi } from "../../api/catalog/CategoryApi";

//models
import type { Category } from "../../models/catalogs/Category";
import { VariantsApi } from "../../api/product/VariantApi";
import type { ProductVariants } from "../../models/products/ProductVariant";

const useHome = () => {
  //category
  const [categories, setCategories] = useState<Category[]>([]);

  const getAllCategories = async () => {
    try {
      const response = await CategoryApi.getAllNoPaging();
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  //suggestion / featured products
  const [suggestProducts, setSuggestProducts] = useState<ProductVariants | []>(
    []
  );

  const getAllSuggestProducts = async () => {
    const data = await VariantsApi.getAll(0, 5);

    setSuggestProducts(data.content);
  };

  const listTopSearch = [
    "ThinkPad T14 Gen5",
    "attach shark x3",
    "xreal air 2 ultra",
    "attack shark r1",
  ];

  return {
    //categories
    categories,
    setCategories,
    getAllCategories,
    //top search
    listTopSearch,
    //suggest products
    getAllSuggestProducts,
    suggestProducts,
  };
};

export default useHome;
