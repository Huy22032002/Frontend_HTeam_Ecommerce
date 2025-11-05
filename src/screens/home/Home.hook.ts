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
      await CategoryApi.getAllNoPaging().then(setCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  //suggestion / featured products
  const [suggestProducts, setSuggestProducts] = useState<ProductVariants | []>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allProducts, setAllProducts] = useState<ProductVariants[]>([]);
  const PRODUCTS_PER_PAGE = 20;

  const getAllSuggestProducts = async (page: number = 0) => {
    const data = await VariantsApi.getAll(page, PRODUCTS_PER_PAGE);

    if (data?.content) {
      setSuggestProducts(data.content);
      setAllProducts(data.content);
    }
    if (data?.totalPages) {
      setTotalPages(data.totalPages);
    }
    setCurrentPage(page + 1);
  };

  // Search products by name (locally)
  const searchProductsByName = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      // Reset to first page of suggested products
      getAllSuggestProducts(0);
      return;
    }

    const filtered = allProducts.filter((product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSuggestProducts(filtered as never);
    setCurrentPage(1);
    setTotalPages(1);
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
    currentPage,
    totalPages,
    setCurrentPage,
    searchProductsByName,
  };
};

export default useHome;
