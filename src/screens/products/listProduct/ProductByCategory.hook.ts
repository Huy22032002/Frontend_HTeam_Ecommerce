import { useState } from "react";
import { ManufacturerApi } from "../../../api/manufacturer/manufacturerApi";
import { ProductApi } from "../../../api/product/ProductApi";
import type { Manufacturer } from "../../../models/manufacturer/Manufacturer";
import type { Product } from "../../../models/products/Product";
import type { ProductVariants } from "../../../models/products/ProductVariant";

const useProductByCategory = () => {
  // Manufacturers
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [variants, setVariants] = useState<ProductVariants[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getListManufacturerByCategory = async (categoryId: number) => {
    try {
      setIsLoading(true);
      const data = await ManufacturerApi.getAllByCategoryId(categoryId);
      if (Array.isArray(data)) {
        setManufacturers(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch manufacturers");
    }
  };

  const getListProductByCategoryId = async (categoryId: number) => {
    try {
      setIsLoading(true);
      const data = await ProductApi.getAllByCategoryId(categoryId);

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
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    manufacturers,
    variants,
    error,
    isLoading,
    getListManufacturerByCategory,
    getListProductByCategoryId,
    //category
    categoryName,
  };
};

export default useProductByCategory;
