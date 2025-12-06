import { useState } from "react";
import { ManufacturerApi } from "../../../api/manufacturer/manufacturerApi";
import { ProductApi } from "../../../api/product/ProductApi";
import { VariantsApi } from "../../../api/product/VariantApi";
import type { Manufacturer } from "../../../models/manufacturer/Manufacturer";
import type { Product } from "../../../models/products/Product";
import type { ProductVariants } from "../../../models/products/ProductVariant";

const useProductByCategory = () => {
  // Manufacturers
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [variants, setVariants] = useState<ProductVariants[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PRODUCTS_PER_PAGE = 20;

  const getListManufacturerByCategory = async (categoryId: number) => {
    try {
      const data = await ManufacturerApi.getAllByCategoryId(categoryId);
      if (Array.isArray(data)) {
        setManufacturers(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch manufacturers");
    }
  };

  const getListProductByCategoryId = async (
    categoryId: number,
    page: number = 0
  ) => {
    try {
      const data = await ProductApi.getAllByCategoryId(
        categoryId,
        page,
        PRODUCTS_PER_PAGE
      );
      console.log("data:", data);
      console.log("firstProduct:", data?.content?.[0]);

      if (data?.content && Array.isArray(data.content)) {
        //category
        setCategoryName(data.content[0].categories[0]);
        //---------
        const allVariants = data.content.flatMap((product: Product) =>
          product.variants.map((variant) => ({
            ...variant,
            productName: product.productName,
            manufacturerName: product.manufacturerName,
            categories: product.categories,
          }))
        );
        setVariants(allVariants);
        if (data.totalPages) {
          setTotalPages(data.totalPages);
        }
        setCurrentPage(page + 1);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
    }
  };

  const getListProductWithFilters = async (filters: {
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    hasSalePrice?: boolean;
    manufacturers?: string[];
    categories?: string[];
    sortBy?: string;
    sortOrder?: string;
    page?: number;
  }) => {
    try {
      const response = await VariantsApi.searchWithFilters({
        name: "",
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        available: filters.available,
        hasSalePrice: filters.hasSalePrice,
        manufacturers: filters.manufacturers,
        categories: filters.categories,
        sortBy: filters.sortBy || "newest",
        sortOrder: filters.sortOrder || "desc",
        page: filters.page || 0,
        size: PRODUCTS_PER_PAGE,
      });

      if (response && response.content && Array.isArray(response.content)) {
        setVariants(response.content);
        setCurrentPage((filters.page || 0) + 1);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch filtered products");
    }
  };

  return {
    manufacturers,
    variants,
    error,
    getListManufacturerByCategory,
    getListProductByCategoryId,
    getListProductWithFilters,
    //category
    categoryName,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};

export default useProductByCategory;
